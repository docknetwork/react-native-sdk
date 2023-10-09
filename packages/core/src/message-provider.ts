import { IDIDProvider } from './did-provider';
import { WalletDocumentTypes, captureException } from './helpers';
import { IWallet } from './types';
import { relayService as defaultRelayService } from '@docknetwork/wallet-sdk-wasm/src/services/relay-service';

const FETCH_MESSAGE_LIMIT = 10;

export interface IMessageProvider {
  sendMessage: (message: any) => Promise<void>;
  fetchMessages: () => Promise<void>;
  processDIDCommMessages: () => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
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
  return {
    async sendMessage({ did, message, recipientDid }) {
      try {
        const keyPairDoc = await getKeyPairDocs(didProvider, did);
        if (!keyPairDoc) {
          throw new Error(`${did} not found in didDocs`);
        }
        await relayService.sendMessage({ keyPairDoc, message, recipientDid });
      } catch (error) {
        captureException(error);
        throw new Error(`Failed to send message: ${error.message}`);
      }
    },

    async processDIDCommMessages() {
      try {
        const messages = await wallet.getDocumentsByType(WalletDocumentTypes.DIDCommMessage);
        const keyPairDocs = await getKeyPairDocs(didProvider);
        for (const { encryptedMessage } of messages) {
          try {
            const decryptedMessage = await relayService.resolveDidcommMessage({ keyPairDocs, encryptedMessage });
            wallet.eventManager.emit('didcomm-message-decrypted', decryptedMessage);
          } catch(err) {
            captureException(err);
            console.error(err);
          }
        }
      } catch (error) {
        captureException(error);
        throw new Error(`Failed to process DIDComm messages: ${error.message}`);
      }
    },

    async markMessageAsRead(messageId: string) {
      try {
        const message = await wallet.getDocumentById(messageId);

        if (message.type !== WalletDocumentTypes.DIDCommMessage) {
          throw new Error(`Document with id ${messageId} is not a DIDCommMessage`);
        }

        await wallet.removeDocument(messageId);
      } catch (error) {
        captureException(error);
        throw new Error(`Failed to mark message as read: ${error.message}`);
      }
    },

    async fetchMessages() {
      try {
        const keyPairDocs = await getKeyPairDocs(didProvider);
        const encryptedMessages = await relayService.getMessages({
          keyPairDocs,
          limit: FETCH_MESSAGE_LIMIT,
          skipMessageResolution: true,
        });

        for (const { _id, encryptedMessage } of encryptedMessages) {
          try {
            await wallet.addDocument({
              id: _id,
              type: WalletDocumentTypes.DIDCommMessage,
              encryptedMessage,
            });
          } catch(err) {
            // this message will be lost if it fails to be stored in the wallet
            captureException(err);
            console.error(err);
          }
        }

        if (encryptedMessages.length > 0) {
          wallet.eventManager.emit('didcomm-messages-received', encryptedMessages);
        }

        return encryptedMessages;
      } catch (error) {
        captureException(error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }
    },
  };
}
