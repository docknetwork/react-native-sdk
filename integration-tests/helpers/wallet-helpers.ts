/**
 * Integration test for empty wallet
 *
 * Ensure that a new wallet can be created and will be functional
 */
import {DataStoreSnapshotV1} from '../data/data-store';
import {WalletBackupJSON, WalletBackupPasssword} from '../data/wallet-backup';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {createWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {setV1LocalStorage} from '@docknetwork/wallet-sdk-data-store/src/migration/migration1/v1-data-store';
import {
  IMessageProvider,
  createMessageProvider,
} from '@docknetwork/wallet-sdk-core/src/message-provider';
import {
  IDIDProvider,
  createDIDProvider,
} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {
  ICredentialProvider,
  createCredentialProvider,
} from '@docknetwork/wallet-sdk-core/src/credential-provider';

let wallet: IWallet;
let didProvider: IDIDProvider;
let credentialProvider: ICredentialProvider;
let messageProvider: IMessageProvider;

export async function createNewWallet(): Promise<IWallet> {
  wallet = await createWallet({
    databasePath: ':memory:',
    dbType: 'sqlite',
    defaultNetwork: 'testnet',
  });

  didProvider = createDIDProvider({wallet});
  credentialProvider = createCredentialProvider({wallet});
  messageProvider = createMessageProvider({wallet, didProvider});

  console.log('Waiting for network connection');
  await wallet.waitForEvent(WalletEvents.networkConnected);
  console.log('Network connected');

  return wallet;
}

export async function getWallet(): Promise<IWallet> {
  if (!wallet) {
    await createNewWallet();
  }
  
  return wallet;
}

export function getMessageProvider(): IMessageProvider {
  return messageProvider;
}

export function getDIDProvider(): IDIDProvider {
  return didProvider;
}

export function getCredentialProvider(): ICredentialProvider {
  return credentialProvider;
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

export async function getAllDocuments() {
  return wallet.query({} as any);
}

export async function getDocumentsByType(type) {
  return wallet.getDocumentsByType(type);
}
