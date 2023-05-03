import {getV1LocalStorage, getWalletDocuments} from './v1-data-store';
import {logger} from '../../logger';
import {migrateV1Data} from './migrate-v1-data';
import {MigrationResult} from '../index';
import {ContextProps} from '../../types';

/**
 * Migrate from v1 to v2
 *
 * v1 data store is stored in local storage
 * v2 will store on typeorm
 *
 */
export async function migration1({
  dataStore,
}: ContextProps): Promise<MigrationResult> {
  logger.debug('Checking if v1 migration is required');

  if (dataStore.version !== 'v1') {
    logger.debug('v1 data migration NOT required');
    return {
      migrated: false,
      version: dataStore.version,
    };
  }

  logger.debug('v1 data Migration required');

  await migrateV1Data();

  return {
    migrated: true,
    version: 'v2',
  };
}

/**
 * Check if a migration from v2 is required
 * Once v2 is migrated, the local storage entry will be removed
 */
export async function isRunningOnV1DataStore({
  dataStore,
}: ContextProps): Promise<boolean> {
  // If sdk version is defined, can skip migration
  if (dataStore.version) {
    return false;
  }

  const v1LocalStorage = getV1LocalStorage();

  if (!v1LocalStorage) {
    return false;
  }

  const documents = await getWalletDocuments();

  if (documents.length === 0) {
    return false;
  }

  return true;
}
