import {getV1LocalStorage} from './v1-data-store';

function migrateDocuments() {}

function migrateNotificaions() {}

function migrateDevSettings() {}

function migrateTransactions() {
  // Will skip this migration for performance improvements
  // That would require Realm db as dependency
  // We can drop the realm.db dependency from the wallet-sdk
  // Transactions will be pulled from subscan into in the new data-store automatically
}

export async function migrateV1Data() {
  await migrateDocuments();
  await migrateNotificaions();
  await migrateDevSettings();
  await migrateTransactions();

  // remove localStorage entries
  await getV1LocalStorage().removeItem('wallet');
}
