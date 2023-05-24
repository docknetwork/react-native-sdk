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
} from '@docknetwork/wallet-sdk-data-store/src/entities/document';
import {CreateWalletProps, IWallet} from './types';
import {toV1Wallet} from './v1-helpers';
import {initWalletWasm} from './wallet-wasm';
import {EventEmitter} from 'events';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';

export type {IWallet};

function once(emitter: EventEmitter, eventName: string) {
  return new Promise(resolve => emitter.once(eventName, resolve));
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

  eventEmitter.once = (eventName: string) =>
    once(eventEmitter, eventName) as any;

  const wallet = {
    eventManager: eventEmitter,
    dataStore,
    getStatus() {
      return status;
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
      });
    },
    updateDocument: (document: any) => {
      return updateDocument({
        dataStore,
        document,
      });
    },
    removeDocument: (id: string) => {
      return removeDocument({
        dataStore,
        id,
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
    importUniversalWalletJSON: (json: any, password: string) => {},
    exportUniversalWalletJSON: (password: string) => {},
  } as IWallet;

  const v1Wallet = await toV1Wallet(wallet);

  await initWalletWasm(v1Wallet);

  return v1Wallet;
}
