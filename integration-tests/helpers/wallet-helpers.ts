/**
 * Integration test for empty wallet
 *
 * Ensure that a new wallet can be created and will be functional
 */
import {Wallet} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';
import {walletService} from '@docknetwork/wallet-sdk-wasm/lib/services/wallet';
import {DataStoreSnapshotV1} from '../data/data-store';
import {WalletBackupJSON, WalletBackupPasssword} from '../data/wallet-backup';

let wallet: Wallet;

export function getWallet(): Wallet {
  return wallet;
}

export async function createNewWallet() {
  wallet = await Wallet.create();

  await wallet.ensureNetwork();
  await walletService.sync();

  return wallet;
}

export async function setNetwork(networkId) {
  return Promise.resolve(wallet.networkManager.setNetworkId(networkId));
}

/**
 * Simulate loading a wallet from a snapshot
 * Used to test data migration for already existing wallets
 */
export async function createWalletFromSnapshot() {
  global.localStorage.setItem('wallet', JSON.stringify(DataStoreSnapshotV1));

  wallet = await Wallet.create();

  await wallet.ensureNetwork();
  await walletService.sync();

  return wallet;
}

export async function createWalletFromBackup() {
  wallet = await Wallet.create({
    json: WalletBackupJSON,
    password: WalletBackupPasssword,
  } as any);

  await wallet.ensureNetwork();
  await walletService.sync();

  return wallet;
}

export function getAllDocuments() {
  return getWallet().query({} as any);
}

export async function getDocumentsByType(type) {
  const documents = await getAllDocuments();

  return documents.filter(doc => {
    if (Array.isArray(doc.type)) {
      return doc.type.includes(type);
    }

    return doc.type === type;
  });
}
