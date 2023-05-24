import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';

let wallet: IWallet;

export function getWallet() {
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }

  return wallet;
}

export async function getOrCreateWallet() {
  if (!wallet) {
    wallet = await initializeWallet();
  }

  return wallet;
}
export async function initializeWallet() {
  wallet = await createWallet({
    databasePath: 'dock-wallet',
    dbType: 'react-native',
  });

  return wallet;
}
