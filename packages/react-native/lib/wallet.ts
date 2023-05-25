import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {dockDocumentNetworkResolver} from '@docknetwork/wallet-sdk-core/src/network-resolver';

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
    testNetworkId: 'testnet',
    documentNetworkResolver: dockDocumentNetworkResolver,
  });

  return wallet;
}
