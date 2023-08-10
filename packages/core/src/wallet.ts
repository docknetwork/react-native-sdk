import {createDataStore} from '@docknetwork/wallet-sdk-data-store/src';
import {
  DataStore,
  DataStoreConfigs,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {
  getDocumentsByType,
  getDocumentById,
  createDocument,
  removeDocument,
  getDocumentCorrelations,
  getAllDocuments,
  updateDocument,
  removeAllDocuments,
} from '@docknetwork/wallet-sdk-data-store/src/entities/document';
import {CreateWalletProps, IWallet} from './types';
import {toV1Wallet} from './v1-helpers';
import {initWalletWasm} from './wallet-wasm';
import {EventEmitter} from 'events';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {walletService} from '@docknetwork/wallet-sdk-wasm/src/services/wallet';
import {importUniversalWalletDocuments} from '@docknetwork/wallet-sdk-data-store/src/migration/migration1/migrate-v1-data';
export type {IWallet};

function once(emitter: EventEmitter, eventName: string) {
  return new Promise(resolve => emitter.once(eventName, resolve));
}

export function ensureDocumentContext(document) {
  if (document['@context']) {
    return document;
  }

  return {
    ...document,
    '@context': ['https://w3id.org/wallet/v1'],
  };
}

/**
 * Create wallet
 *
 * @param createWalletProps
 * @returns {Promise<IWallet>}
 */
export async function createWallet(
  createWalletProps: CreateWalletProps,
): Promise<IWallet> {
  const dataStore = await createDataStore(createWalletProps);
  let status;

  const eventEmitter = new EventEmitter();

  const wallet = {
    eventManager: eventEmitter,
    waitForEvent: (eventName: string) => once(eventEmitter, eventName) as any,
    dataStore,
    getStatus() {
      return status;
    },
    resolveDocumentNetwork: async (document: any) => {
      return dataStore.resolveDocumentNetwork({
        document,
        dataStore,
      });
    },
    deleteWallet: async () => {
      await removeAllDocuments({
        dataStore,
      });

      eventEmitter.emit(WalletEvents.walletDeleted);
    },
    setStatus(newStatus: string) {
      status = newStatus;
    },
    setNetwork: async (networkId: string) => {
      await dataStore.setNetwork(networkId);
      eventEmitter.emit(WalletEvents.networkUpdated, networkId);
    },
    getNetworkId: () => {
      return dataStore.networkId;
    },
    getDocumentById: id =>
      getDocumentById({
        dataStore,
        id,
      }),

    getAllDocuments: () => {
      return getAllDocuments({
        dataStore,
      });
    },
    getDocumentsByType: type =>
      getDocumentsByType({
        dataStore,
        type,
      }),
    addDocument: (json: any) => {
      return createDocument({
        dataStore,
        json,
      }).then(result => {
        eventEmitter.emit(WalletEvents.documentAdded, result);
        return result;
      });
    },
    updateDocument: (document: any) => {
      return updateDocument({
        dataStore,
        document,
      }).then(result => {
        eventEmitter.emit(WalletEvents.documentUpdated, result);
        return result;
      });
    },
    removeDocument: (id: string) => {
      return removeDocument({
        dataStore,
        id,
      }).then(result => {
        eventEmitter.emit(WalletEvents.documentRemoved, result);
        return result;
      });
    },
    getDocumentCorrelations: (documentId: string) => {
      return getDocumentCorrelations({
        dataStore,
        documentId,
      });
    },
    getAccountKeyPair: async (accountId: string) => {
      const correlations = await getDocumentCorrelations({
        dataStore,
        documentId: accountId,
      });

      const keyPair = correlations.find(
        correlation => correlation.type === 'KeyringPair',
      );

      return keyPair?.value;
    },
    getDocumentsFromEncryptedWallet: async (json: any, password: string) => {
      return walletService.getDocumentsFromEncryptedWallet({
        encryptedJSONWallet: json,
        password,
      });
    },
    importUniversalWalletJSON: async (json: any, password: string) => {
      const documents = await walletService.getDocumentsFromEncryptedWallet({
        encryptedJSONWallet: json,
        password,
      });

      await importUniversalWalletDocuments({
        documents,
        dataStore,
      });

      return documents;
    },
    exportDocuments: async (params: {documents: any; password: string}) => {
      const documents = params.documents.map(ensureDocumentContext);
      return walletService.exportDocuments({
        documents,
        password: params.password,
      });
    },
    exportUniversalWalletJSON: async (password: string) => {
      let documents = await getAllDocuments({
        dataStore,
        allNetworks: true,
      });

      const result = await wallet.exportDocuments({
        documents,
        password,
      });

      return result;
    },
  } as IWallet;

  const v1Wallet = await toV1Wallet(wallet);

  await initWalletWasm(v1Wallet);

  return v1Wallet;
}
