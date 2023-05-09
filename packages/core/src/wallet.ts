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
} from '@docknetwork/wallet-sdk-data-store/src/entities/document';
import {CreateWalletProps, IWallet} from './types';
import {toV1Wallet} from './v1-helpers';

export type {IWallet};
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

  const wallet = {
    dataStore,
    setNetworkId: (networkId: string) => {
      dataStore.networkId = networkId;
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
    importUniversalWalletJSON: (json: any, password: string) => {},
    exportUniversalWalletJSON: (password: string) => {},
  } as IWallet;

  const v1Wallet = await toV1Wallet(wallet);

  return {
    ...v1Wallet,
    ...wallet,
  };
}
