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
import {CreateWalletProps, Wallet} from './types';

/**
 * Create wallet
 *
 * @param createWalletProps
 * @returns {Promise<Wallet>}
 */
export async function createWallet(
  createWalletProps: CreateWalletProps,
): Promise<Wallet> {
  const dataStore = await createDataStore(createWalletProps);

  return {
    dataStore,
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
  } as Wallet;
}
