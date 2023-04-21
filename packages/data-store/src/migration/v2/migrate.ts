import {getV1LocalStorage, getWalletDocument} from './v1-data-store';
import {MigrationInput, MigrationResult} from '../../types/types';
import {logger} from '../../logger';
import {migrateV1Data} from './migrate-v1-data';

function bootstrapV2Tables() {}

export async function migrateToV2({
  sdkConfigs,
}: MigrationInput): Promise<MigrationResult> {
  logger.debug('Migrating v2');

  if (sdkConfigs.version !== null) {
    return {
      migrated: false,
      sdkConfigs,
    };
  }
  // bootstrap v2 data
  await bootstrapV2Tables();

  // check current version
  const needV1DataMigration = await shouldMigrate({sdkConfigs});

  if (needV1DataMigration) {
    logger.debug('v1 data Migration required');
    await migrateV1Data();
  }

  return {
    migrated: true,
    sdkConfigs: {
      ...sdkConfigs,
      version: 'v2',
    },
  };
}

/**
 * Check if a migration from v2 is required
 * Once v2 is migrated, the local storage entry will be removed
 */
export async function shouldMigrate({
  sdkConfigs,
}: MigrationInput): Promise<boolean> {
  // If sdk version is defined, can skip migration
  if (sdkConfigs.version) {
    return false;
  }

  const v1LocalStorage = getV1LocalStorage();

  if (!v1LocalStorage) {
    return false;
  }

  const documents = await getWalletDocument();

  if (documents.length === 0) {
    return false;
  }

  return true;
}
