import {createDataStore} from '@docknetwork/wallet-sdk-data-store/src';
import {
  DataStoreConfigs,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {getDocumentsByType} from '@docknetwork/wallet-sdk-data-store/src/typeorm/entities/document/get-documens-by-type';
import {getDocumentById} from '@docknetwork/wallet-sdk-data-store/src/typeorm/entities/document/get-document-by-id';

interface Wallet {
  getDocumentById: (id: string) => Promise<WalletDocument>;
  getDocumentsByType: (type: string) => Promise<WalletDocument[]>;
}

type CreateWalletProps = DataStoreConfigs & {};

export async function createWallet(
  createWalletProps: CreateWalletProps,
): Promise<Wallet> {
  const dataStore = await createDataStore(createWalletProps);

  return {
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
  };
}
