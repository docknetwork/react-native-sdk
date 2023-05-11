import {initializeTypeORM} from './typeorm';
import {DataStore, DataStoreConfigs} from './types';
import {migrate} from './migration';
import {DEFAULT_CONFIGS} from './configs';
import {logger} from './logger';
import {DataSource} from 'typeorm';

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
    version: null,
    resolveDocumentNetwork: options.documentNetworkResolver,
  };

  await migrate({dataStore});

  return dataStore;
}

/**
 * Close the data store connection with the database
 *
 */
export async function closeDataStore(dataStore: DataStore) {
  await dataStore.db.destroy();
}
