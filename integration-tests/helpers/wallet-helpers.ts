/**
 * Integration test for empty wallet
 *
 * Ensure that a new wallet can be created and will be functional
 */
import {DataStoreSnapshotV1} from '../data/data-store';
import {WalletBackupJSON, WalletBackupPasssword} from '../data/wallet-backup';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {createWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';
import {Wallet} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {setV1LocalStorage} from '@docknetwork/wallet-sdk-data-store/src/migration/migration1/v1-data-store';

let wallet: IWallet;

export function getWallet(): IWallet {
  return wallet;
}

export async function createNewWallet() {
  wallet = await createWallet({
    databasePath: ':memory:',
    dbType: 'sqlite',
    defaultNetwork: 'testnet',
  });

  Wallet.getInstance = () => wallet;

  await wallet.ensureNetwork();

  return wallet;
}

export async function setNetwork(networkId) {
  return Promise.resolve(wallet.setNetwork(networkId));
}

/**
 * Simulate loading a wallet from a snapshot
 * Used to test data migration for already existing wallets
 */
export async function createWalletFromSnapshot() {
  global.localStorage.setItem('wallet', JSON.stringify(DataStoreSnapshotV1));

  setV1LocalStorage(global.localStorage as any);

  return createNewWallet();
}

export async function createWalletFromBackup() {
  wallet = await createNewWallet();
  await wallet.importUniversalWalletJSON(
    WalletBackupJSON,
    WalletBackupPasssword,
  );

  await wallet.ensureNetwork();

  return wallet;
}

export function getAllDocuments() {
  return getWallet().query({} as any);
}

export async function getDocumentsByType(type) {
  return wallet.getDocumentsByType(type);
}
