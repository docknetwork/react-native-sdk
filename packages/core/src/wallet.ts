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
} from '@docknetwork/wallet-sdk-data-store/src/entities/document';
import {CreateWalletProps, IWallet} from './types';

export {IWallet};
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

  return {
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
    importUniversalWalletJSON: (json: any, password: string) => {},
    exportUniversalWalletJSON: (password: string) => {},
  } as IWallet;
}
