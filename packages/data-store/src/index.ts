import {getDataSource, initializeTypeORM} from './typeorm';
import {DataStoreConfigs} from './types/types';
import {migrate} from './migration';
import {
  defaultDataStoreConfigs,
  getSDKConfigs,
  setActiveWallet,
} from './configs';
import {logger} from './logger';

export async function createDataStore(_options: DataStoreConfigs = {}) {
  const options = {
    ...defaultDataStoreConfigs,
    ..._options,
  };

  logger.debug(
    `Initializing data store with configs: ${JSON.stringify(options)}`,
  );

  await initializeTypeORM(options);
  await migrate(options);

  const configs = await getSDKConfigs(options);
  setActiveWallet(configs.activeWallet);

  return true;
}
