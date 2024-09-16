import {CreateWalletProps, IWallet} from './types';
import {toV1Wallet} from './v1-helpers';
import {initWalletWasm} from './wallet-wasm';
import {EventEmitter} from 'events';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {walletService} from '@docknetwork/wallet-sdk-wasm/src/services/wallet';
import {importUniversalWalletDocuments} from '@docknetwork/wallet-sdk-data-store/src/helpers';
import {ensureDID} from './did-provider';
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
export async function createWallet({
  dataStore,
}: CreateWalletProps): Promise<IWallet> {
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
      await dataStore.documents.removeAllDocuments();

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
    getDocumentById: dataStore.documents.getDocumentById,
    getAllDocuments: dataStore.documents.getAllDocuments,
    getDocumentsById: dataStore.documents.getDocumentsById,
    getDocumentsByType: dataStore.documents.getDocumentsByType,
    addDocument: (json: any) => {
      return dataStore.documents.addDocument(json).then(result => {
        eventEmitter.emit(WalletEvents.documentAdded, result);
        return result;
      });
    },
    updateDocument: (document: any) => {
      return dataStore.documents.updateDocument(document).then(result => {
        eventEmitter.emit(WalletEvents.documentUpdated, result);
        return result;
      });
    },
    removeDocument: async (id: string) => {
      const document = await wallet.getDocumentById(id);

      return dataStore.documents.removeDocument(id).then(result => {
        eventEmitter.emit(WalletEvents.documentRemoved, document);
        return result;
      });
    },
    getDocumentCorrelations: (documentId: string) => {
      return dataStore.documents.getDocumentCorrelations(documentId);
    },
    getAccountKeyPair: async (accountId: string) => {
      const correlations = await dataStore.documents.getDocumentCorrelations(accountId);

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
      let documents = await dataStore.documents.getAllDocuments(true);

      const result = await wallet.exportDocuments({
        documents,
        password,
      });

      return result;
    },
  } as IWallet;

  const v1Wallet = await toV1Wallet(wallet);

  await initWalletWasm(v1Wallet);

  await ensureDID({
    wallet: v1Wallet,
  });

  [WalletEvents.networkUpdated, WalletEvents.walletDeleted].forEach(event =>
    eventEmitter.on(event, () => {
      ensureDID({
        wallet: v1Wallet,
      });
    }),
  );

  return v1Wallet;
}
