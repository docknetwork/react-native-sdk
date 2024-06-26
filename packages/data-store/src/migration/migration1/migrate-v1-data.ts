import {getV1LocalStorage} from './v1-data-store';
import {createDocument} from '../../entities/document';
import {documentHasType} from '../../helpers';

export async function importUniversalWalletDocuments({documents, dataStore}) {
  for (const _document of documents) {
    let document = _document;
    if (documentHasType(document, 'VerifiableCredential') && document.value) {
      document = document.value;
    }

    try {
      await createDocument({
        dataStore,
        json: document,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
async function migrateDocuments({v1Storage, dataStore}) {
  const walletJSON = await v1Storage.getItem('wallet');
  const wallet = JSON.parse(walletJSON);

  const documents = Object.keys(wallet).map(key => wallet[key]);

  await importUniversalWalletDocuments({documents, dataStore});
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
  const walletJSON = await v1Storage.getItem('wallet');
  await v1Storage.setItem('wallet-backup', walletJSON);
  await v1Storage.removeItem('wallet');
}
