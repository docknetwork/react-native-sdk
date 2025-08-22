import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {IDIDProvider} from './did-provider';
import {WalletDocumentTypes, captureException} from './helpers';
import {IWallet} from './types';
import {relayService as defaultRelayService} from '@docknetwork/wallet-sdk-wasm/src/services/relay-service';

const FETCH_MESSAGE_LIMIT = 10;

export interface IMessageProvider {
  sendMessage: (message: any) => Promise<any>;
  fetchMessages: () => Promise<void>;
  processDIDCommMessages: () => Promise<void>;
  startAutoFetch: (timeout?: number) => () => void;
  addMessageListener: (handler: () => void) => () => void;
  waitForMessage: () => Promise<any>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  clearCache: () => Promise<void>;
  processMessageRecurrentJob: () => Promise<void>;
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

  let processingLock = false;
  async function processDIDCommMessages(limit = 1) {
    if (processingLock) {
      return;
    }

    processingLock = true;
    try {
      const processMessagesStartTime = Date.now();
      const messages = await wallet.getDocumentsByType(
        WalletDocumentTypes.DIDCommMessage,
      );

      if (messages.length === 0) {
        return;
      }

      logger.debug('Processing DIDComm messages');
      

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
          await markMessageAsRead(message.id);
          count++;
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
    } finally {
      processingLock = false;
    }
  }

  let recentlyFetchedMessages = [];

  async function fetchMessages() {
    try {
      logger.debug('Fetching messages');
      const fetchMessagesStartTime = Date.now();
      const keyPairDocs = await getKeyPairDocs(didProvider);
      let encryptedMessages = await relayService.getMessages({
        keyPairDocs,
        limit: FETCH_MESSAGE_LIMIT,
        skipMessageResolution: true,
      });
      const messageIdsPerDid = {};

      encryptedMessages = encryptedMessages.filter(
        message => !recentlyFetchedMessages.includes(message._id),
      );

      if (!encryptedMessages.length) {
        return;
      }

      logger.debug(`Fetched ${encryptedMessages.length} messages`);

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

          recentlyFetchedMessages.push(message._id);
        } catch (err) {
          logger.debug(
            `Failed to store message in wallet: ${JSON.stringify(message)}`,
          );
          // this message will be lost if it fails to be stored in the wallet
          captureException(err);
        }
      }

      for (const [did, messageIds] of Object.entries(messageIdsPerDid)) {
        logger.debug(
          `Acknowledging ${
            (messageIds as string[])?.length
          } messages for ${did}`,
        );
        let startTime = new Date().getTime();
        relayService
          .ackMessages({
            did,
            messageIds,
          })
          .then(() => {
            logger.performance('Acknowledged messages', startTime);
          })
          .catch(err => {
            console.error('Failed to ack messages', err.message);
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
    };

    wallet.eventManager.addListener('didcomm-message-decrypted', listener);
    return () =>
      wallet.eventManager.removeListener('didcomm-message-decrypted', listener);
  }

  let listenerIntervalId = null;

  const processMessageInterval = 3000;

  async function processMessageRecurrentJob() {
    try {
      await processDIDCommMessages();
    } finally {
      setTimeout(processMessageRecurrentJob, processMessageInterval);
    }
  }

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
        return await relayService.sendMessage({
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
    processMessageRecurrentJob,
    markMessageAsRead,
  } as any;
}
