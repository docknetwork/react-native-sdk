import assert from 'assert';
import {createWallet, getWallet, updateWallet} from './entities/wallet.entity';
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
  DataSource,
  DataStore,
  DataStoreConfigs,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import { logger } from '@docknetwork/wallet-sdk-data-store/src/logger';

// setLocalStorage(global.localStorage);

export async function createDataStore(
  configs: DataStoreConfigs,
): Promise<DataStore> {
  const dataSource: DataSource = {
    async destroy() {
      return;
    },
    async initialize() {
      return;
    }
  }

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
    localStorageImpl: global.localStorage,
    walletStore: {
      getWallet: async () => {
        return getWallet({dataStore});
      },
      updateWallet: async () => {
        return updateWallet({dataStore});
      },
    },
  });

  // await migrate({dataStore});

  let wallet = await dataStore.wallet.getWallet();

  if (!wallet) {
    wallet = await createWallet({
      dataStore,
    });
  }
  
  dataStore.networkId = wallet.networkId;
  dataStore.network = dataStore.networks.find(
    item => item.id === wallet.networkId,
  );

  dataStore.documents.getAllDocuments().then(documents => {
    logger.debug(`Wallet loaded with ${documents.length} documents`);
  });


  return dataStore;
}
