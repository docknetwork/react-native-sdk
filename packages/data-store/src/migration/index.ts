import {isRunningOnV1DataStore, migration1} from './migration1';
import {ContextProps} from '../types';
import {logger} from '../logger';
import {createWallet, getWallet, updateWallet} from '../entities/wallet.entity';
import {bootstrapTables} from './bootstrap-tables';

export const CURRENT_DATA_STORE_VERSION = 'v2';

export type MigrationResult = {
  migrated: boolean;
  version: string;
};

const migrations = [
  migration1,
  // add new migrations here
];

export async function migrate({dataStore}: ContextProps) {
  // bootstrap v2 data
  await bootstrapTables(dataStore.db);

  // Fetch existing configs from the database
  let existingConfigs = await getWallet({dataStore});

  // Force v1 migration
  // dataStore.version = 'v1';
  // If no configs exist, create a new one
  if (!existingConfigs) {
    logger.debug('Wallet not found in the database, creating a new wallet...');
    const isV1DataStore = await isRunningOnV1DataStore({dataStore});
    logger.debug(`Is v1 data store: ${isV1DataStore}`);
    dataStore.version = isV1DataStore ? 'v1' : CURRENT_DATA_STORE_VERSION;
    await createWallet({
      dataStore,
    });
    logger.debug('universal wallet created');
  }

  for (const migrate of migrations) {
    const results = await migrate({dataStore});

    if (results.migrated) {
      logger.debug('Migration completed');
      dataStore.version = results.version;
      await updateWallet({dataStore});
    } else {
      logger.debug('Migration not required');
    }
  }

  logger.debug(`DataStore version: ${dataStore.version}`);
}
