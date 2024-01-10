import {initializeTypeORM} from './helpers';
import {DataStore, DataStoreConfigs} from './types';
import {migrate} from './migration';
import {DEFAULT_CONFIGS} from './configs';
import {logger} from './logger';
import {DataSource} from './typeorm';
import assert from 'assert';
import {getWallet, updateWallet} from './entities/wallet.entity';
import { getV1LocalStorage } from './migration/migration1/v1-data-store';
import { getAllDocuments } from './entities/document';


export const getLocalStorage = getV1LocalStorage;

export async function updateNetwork({
  dataStore,
  networkId,
}: {
  dataStore: DataStore;
  networkId: string;
}): Promise<void> {
  const network = dataStore.networks.find(item => item.id === networkId);

  assert(!!network, `Invalid network id ${networkId}`);

  dataStore.network = network;
  dataStore.networkId = networkId;

  await updateWallet({dataStore});
}

export async function createDataStore(
  _options: DataStoreConfigs,
): Promise<DataStore> {
  const options: DataStoreConfigs = {
    ...DEFAULT_CONFIGS,
    ..._options,
  };

  if (!options.defaultNetwork) {
    options.defaultNetwork = options.networks[0].id;
  }

  const dataSource: DataSource = await initializeTypeORM(options);
  const dataStore: DataStore = {
    db: dataSource,
    networkId: options.defaultNetwork,
    network: options.networks.find(item => item.id === options.defaultNetwork),
    testNetworkId: options.testNetworkId,
    mainNetworkId: options.mainNetworkId,
    version: null,
    networks: options.networks,
    resolveDocumentNetwork: options.documentNetworkResolver,
    setNetwork: (networkId: string) => {
      logger.debug(`Setting network to ${networkId}`);
      return updateNetwork({dataStore, networkId});
    },
  };

  logger.debug('Data store initialized');

  await migrate({dataStore});

  const wallet = await getWallet({dataStore});
  dataStore.networkId = wallet.networkId;
  dataStore.network = options.networks.find(
    item => item.id === wallet.networkId,
  );

  getAllDocuments({dataStore}).then(documents => {
    logger.debug(`Wallet loaded with ${documents.length} documents`);
  });

  return dataStore;
}

/**
 * Close the data store connection with the database
 *
 */
export async function closeDataStore(dataStore: DataStore) {
  await dataStore.db.destroy();
}
