import {getDataSource} from '../typeorm';
import {SDKConfigsEntity} from '../typeorm/entities/sdk-configs.entity';
import {migrateToV2} from './v2/migrate';
import {DataStoreConfigs, SDKConfigs} from '../types/types';
import {logger} from '../logger';
import {getSDKConfigs} from '../configs';

export const CURRENT_DATA_STORE_VERSION = 'v2';

const migrations = [
  migrateToV2,
  // add new migrations here
];

export async function migrate(options: DataStoreConfigs) {
  let sdkConfigs: SDKConfigs = await getSDKConfigs(options);

  for (const migrate of migrations) {
    const results = await migrate({
      sdkConfigs,
    });

    if (results.migrated) {
      logger.debug('Migration completed');
      sdkConfigs = results.sdkConfigs;
    } else {
      logger.debug('Migration not required');
    }
  }

  logger.debug(`DataStore version: ${sdkConfigs.version}`);

  await getDataSource().getRepository(SDKConfigsEntity).save(sdkConfigs);
}
