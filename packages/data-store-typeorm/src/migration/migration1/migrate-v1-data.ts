import {getV1LocalStorage} from './v1-data-store';
import {importUniversalWalletDocuments} from '@docknetwork/wallet-sdk-data-store/src/helpers';

async function migrateDocuments({v1Storage, dataStore}) {
  const walletJSON = await v1Storage.getItem('wallet');
  const wallet = JSON.parse(walletJSON);

  const documents = Object.keys(wallet).map(key => wallet[key]);

  await importUniversalWalletDocuments({documents, dataStore});
}

function migrateNotificaions() {}

function migrateDevSettings() {}

export async function migrateV1Data({dataStore}) {
  const v1Storage = getV1LocalStorage();

  await migrateDocuments({
    v1Storage,
    dataStore,
  });
  await migrateNotificaions();
  await migrateDevSettings();

  // remove localStorage entries
  const walletJSON = await v1Storage.getItem('wallet');
  await v1Storage.setItem('wallet-backup', walletJSON);
  await v1Storage.removeItem('wallet');
}
