import {initializeTypeORM} from './typeorm';
import {DataStore, DataStoreConfigs} from './types';
import {migrate} from './migration';
import {DEFAULT_CONFIGS} from './configs';
import {logger} from './logger';
import {DataSource} from 'typeorm';
import assert from 'assert';
import {getWallet, updateWallet} from './entities/wallet.entity';

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

  logger.debug(
    `Initializing data store with configs: ${JSON.stringify(options)}`,
  );

  const dataSource: DataSource = await initializeTypeORM(options);
  const dataStore: DataStore = {
    db: dataSource,
    networkId: options.defaultNetwork,
    network: options.networks.find(item => item.id === options.defaultNetwork),
    version: null,
    networks: options.networks,
    resolveDocumentNetwork: options.documentNetworkResolver,
    setNetwork: (networkId: string) => {
      return updateNetwork({dataStore, networkId});
    },
  };

  await migrate({dataStore});

  const wallet = await getWallet({dataStore});
  dataStore.networkId = wallet.networkId;

  console.log('current saved wallet on db', wallet);

  return dataStore;
}

/**
 * Close the data store connection with the database
 *
 */
export async function closeDataStore(dataStore: DataStore) {
  await dataStore.db.destroy();
}
