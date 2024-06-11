import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {IDIDProvider} from './did-provider';
import {WalletDocumentTypes, captureException} from './helpers';
import {IWallet} from './types';
import {relayService as defaultRelayService} from '@docknetwork/wallet-sdk-wasm/src/services/relay-service';

const FETCH_MESSAGE_LIMIT = 10;

export interface IMessageProvider {
  sendMessage: (message: any) => Promise<void>;
  fetchMessages: () => Promise<void>;
  processDIDCommMessages: () => Promise<void>;
  startAutoFetch: (timeout?: number) => () => void;
  addMessageListener: (handler: () => void) => () => void;
  waitForMessage: () => Promise<any>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  clearCache: () => Promise<void>;
}

async function getKeyPairDocs(didProvider: IDIDProvider, did?: string) {
  try {
    const keyPairDocs = await didProvider.getDIDKeyPairs();
    if (did) {
      return keyPairDocs.find(doc => doc.controller === did);
    }
    return keyPairDocs;
  } catch (error) {
    throw new Error(`Failed to get key pair docs: ${error.message}`);
  }
}

export function createMessageProvider({
  wallet,
  didProvider,
  relayService = defaultRelayService,
}: {
  wallet: IWallet;
  didProvider: IDIDProvider;
  relayService?: any;
}) {
  async function markMessageAsRead(messageId: string) {
    try {
      const message = await wallet.getDocumentById(messageId);

      if (message.type !== WalletDocumentTypes.DIDCommMessage) {
        throw new Error(
          `Document with id ${messageId} is not a DIDCommMessage`,
        );
      }

      await wallet.removeDocument(messageId);
    } catch (error) {
      captureException(error);
      console.error(`Failed to mark message as read: ${error.message}`);
    }
  }

  async function processDIDCommMessages(limit = 1) {
    try {
      const processMessagesStartTime = Date.now();
      logger.debug('Processing DIDComm messages');
      const messages = await wallet.getDocumentsByType(
        WalletDocumentTypes.DIDCommMessage,
      );
      const keyPairDocs = await getKeyPairDocs(didProvider);
      let count = 0;
      for (const message of messages) {
        if (count >= limit) {
          return;
        }
        try {
          if (!message.encryptedMessage) {
            await wallet.removeDocument(message.id);
            throw new Error(
              `Message with payload ${JSON.stringify(message)} is invalid`,
            );
          }
          const decryptedMessage = await relayService.resolveDidcommMessage({
            keyPairDocs,
            message: message.encryptedMessage,
          });
          wallet.eventManager.emit('didcomm-message-decrypted', {
            decryptedMessage,
            messageId: message.id,
          });
          count++;
          // the wallet app will call markMessageAsRead after the message is processed
        } catch (err) {
          if (err.message?.includes('the DID in question does not exist')) {
            // the DID lookup failed (a testnet credential was issued to a mainnet did), so we can't
            // decrypt the message remove the message from the wallet
            await wallet.removeDocument(message.id);
          }
          captureException(err);
        }
      }
      logger.performance('Processed messages', processMessagesStartTime);
    } catch (error) {
      captureException(error);
      throw new Error(`Failed to process DIDComm messages: ${error.message}`);
    }
  }

  async function fetchMessages() {
    try {
      logger.debug('Fetching messages');
      const fetchMessagesStartTime = Date.now();
      const keyPairDocs = await getKeyPairDocs(didProvider);
      const encryptedMessages = await relayService.getMessages({
        keyPairDocs,
        limit: FETCH_MESSAGE_LIMIT,
        skipMessageResolution: true,
      });
      const messageIdsPerDid = {};

      if (encryptedMessages.length) {
        console.log(`Fetched ${encryptedMessages.length} messages`);
      }

      for (const message of encryptedMessages) {
        try {
          if (!messageIdsPerDid[message.to]) {
            messageIdsPerDid[message.to] = [];
          }

          messageIdsPerDid[message.to].push(message._id);

          await wallet.addDocument({
            id: message._id,
            type: WalletDocumentTypes.DIDCommMessage,
            encryptedMessage: message,
          });
        } catch (err) {
          // this message will be lost if it fails to be stored in the wallet
          captureException(err);
        }
      }

      for (const [did, messageIds] of Object.entries(messageIdsPerDid)) {
        logger.debug(`Acknowledging messages for ${did}`);
        let startTime = new Date().getTime();
        relayService
          .ackMessages({
            did,
            messageIds,
          })
          .catch(err => {
            console.error('Failed to ack messages', err.message);
          })
          .finally(() => {
            logger.performance('Acknowledged messages', startTime);
          });
      }

      if (encryptedMessages.length > 0) {
        wallet.eventManager.emit(
          'didcomm-messages-received',
          encryptedMessages,
        );

        logger.debug(`Received ${encryptedMessages.length} messages`);
        logger.performance('Fetched messages', fetchMessagesStartTime);
      }

      return encryptedMessages;
    } catch (error) {
      captureException(error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  function addMessageListener(handler) {
    const listener = async message => {
      await Promise.resolve(handler(message.decryptedMessage));
      markMessageAsRead(message.messageId);
    };

    wallet.eventManager.addListener('didcomm-message-decrypted', listener);
    return () =>
      wallet.eventManager.removeListener('didcomm-message-decrypted', listener);
  }

  let listenerIntervalId = null;

  return {
    async sendMessage({
      did,
      recipientDid,
      message,
      // didcomm message parameters
      from,
      to,
      body,
      type,
    }) {
      // TODO: rename relay service parameters to make it easier to understand
      if (from) {
        did = from;
      }

      if (to) {
        recipientDid = to;
      }

      if (!message && body) {
        message = body;
      }

      try {
        const keyPairDoc = await getKeyPairDocs(didProvider, did);
        if (!keyPairDoc) {
          throw new Error(`${did} not found in didDocs`);
        }
        await relayService.sendMessage({
          keyPairDoc,
          message,
          recipientDid,
          type,
        });
      } catch (error) {
        captureException(error);
        throw new Error(`Failed to send message: ${error.message}`);
      }
    },
    waitForMessage() {
      return new Promise((resolve: any) => {
        let removeListener = addMessageListener(async message => {
          removeListener();
          await resolve(message);
        });
      });
    },
    startAutoFetch(timeout = 2000) {
      clearInterval(listenerIntervalId);
      listenerIntervalId = setInterval(async () => {
        await fetchMessages();
        await processDIDCommMessages();
      }, timeout);

      return () => clearInterval(listenerIntervalId);
    },
    clearCache: async () => {
      return Promise.all(
        (
          await wallet.getDocumentsByType(WalletDocumentTypes.DIDCommMessage)
        ).map(document => {
          markMessageAsRead(document.id);
          return wallet.removeDocument(document.id);
        }),
      );
    },
    fetchMessages,
    addMessageListener,
    processDIDCommMessages,
    markMessageAsRead,
  } as any;
}
