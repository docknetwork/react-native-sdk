import {initializeTypeORM} from './helpers';
import {migrate} from './migration';
import {DataSource} from './typeorm';
import assert from 'assert';
import {getWallet, updateWallet} from './entities/wallet.entity';
import {getV1LocalStorage} from './migration/migration1/v1-data-store';
import {
  createDocument,
  getAllDocuments,
  removeDocument,
  getDocumentsById,
  getDocumentsByType,
  updateDocument,
  getDocumentById,
  removeAllDocuments,
  getDocumentCorrelations,
} from './entities/document';
import {
  createDataStore as createGenericDataStore,
  parseConfigs,
  setLocalStorage,
} from '@docknetwork/wallet-sdk-data-store/src/index';

import {
  DataStore,
  DataStoreConfigs,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import { logger } from '@docknetwork/wallet-sdk-data-store/src/logger';

setLocalStorage(getV1LocalStorage());

export async function createDataStore(
  configs: DataStoreConfigs,
): Promise<DataStore> {
  const options = parseConfigs(configs);

  const dataSource: DataSource = await initializeTypeORM(options);
  const dataStore = await createGenericDataStore({
    configs: configs,
    dataSource: dataSource as any,
    documentStore: {
      addDocument: async (json, options) => {
        return createDocument({
          dataStore,
          json,
          options,
        });
      },
      removeDocument: async (id, options) => {
        return removeDocument({
          dataStore,
          id,
          options,
        });
      },
      updateDocument: async (document, options) => {
        return updateDocument({
          dataStore,
          document,
          options,
        });
      },
      getDocumentById: async id => {
        return getDocumentById({
          dataStore,
          id,
        });
      },
      getDocumentsByType: async type => {
        return getDocumentsByType({
          dataStore,
          type,
        });
      },
      getDocumentsById: async idList => {
        return getDocumentsById({
          dataStore,
          idList,
        });
      },
      getAllDocuments: async (allNetworks?: boolean) => {
        return getAllDocuments({
          allNetworks,
          dataStore,
        });
      },
      removeAllDocuments: async () => {
        return removeAllDocuments({
          dataStore,
        });
      },
      getDocumentCorrelations: async documentId => {
        return getDocumentCorrelations({
          dataStore,
          documentId,
        });
      },
    },
    localStorageImpl: getV1LocalStorage(),
    walletStore: {
      getWallet: async () => {
        return getWallet({dataStore});
      },
      updateWallet: async () => {
        return updateWallet({dataStore});
      },
    },
  });

  migrate({dataStore});

  const wallet = await dataStore.wallet.getWallet();
  dataStore.networkId = wallet.networkId;
  dataStore.network = options.networks.find(
    item => item.id === wallet.networkId,
  );

  dataStore.documents.getAllDocuments().then(documents => {
    logger.debug(`Wallet loaded with ${documents.length} documents`);
  });


  return dataStore;
}
