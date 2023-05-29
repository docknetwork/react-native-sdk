import {getV1LocalStorage} from './v1-data-store';
import {createDocument} from '../../entities/document';
import {documentHasType} from '../../helpers';

async function migrateDocuments({v1Storage, dataStore}) {
  const walletJSON = v1Storage.getItem('wallet');
  const wallet = JSON.parse(walletJSON);

  for (const key in wallet) {
    let document = wallet[key];

    if (documentHasType(document, 'VerifiableCredential') && document.value) {
      document = document.value;
    }

    await createDocument({
      dataStore,
      json: document,
    });
  }
}

function migrateNotificaions() {}

function migrateDevSettings() {}

function migrateTransactions() {
  // Will skip this migration for performance improvements
  // That would require Realm db as dependency
  // We can drop the realm.db dependency from the wallet-sdk
  // Transactions will be pulled from subscan into in the new data-store automatically
}

export async function migrateV1Data({dataStore}) {
  const v1Storage = getV1LocalStorage();

  await migrateDocuments({
    v1Storage,
    dataStore,
  });
  await migrateNotificaions();
  await migrateDevSettings();
  await migrateTransactions();

  // remove localStorage entries
  await v1Storage.removeItem('wallet');
}
