import {getV1LocalStorage} from './v1-data-store';
import {createDocument} from '../../entities/document';

async function migrateDocuments({v1Storage, dataStore}) {
  const walletJSON = v1Storage.getItem('wallet');
  const wallet = JSON.parse(walletJSON);
  const documents = Object.keys(wallet).map(key => wallet[key]);
  const isImported = {};

  async function checkAndImport(documentOrId) {
    const document =
      typeof documentOrId === 'string'
        ? documents.find(doc => doc.id === documentOrId)
        : documentOrId;

    if (isImported[document.id]) {
      return;
    }

    if (document.correlation && Array.isArray(document.correlation)) {
      for (const correlation of document.correlation) {
        await checkAndImport(correlation);
      }
    }

    await createDocument({
      dataStore,
      json: document,
    });

    isImported[document.id] = true;
  }

  for (const key in wallet) {
    const document = wallet[key];
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
