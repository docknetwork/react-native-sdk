import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {dockDocumentNetworkResolver} from '@docknetwork/wallet-sdk-core/src/network-resolver';
import {DataStoreConfigs} from '@docknetwork/wallet-sdk-data-store/src/types';

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
export async function initializeWallet(params: DataStoreConfigs = {} as any) {
  wallet = await createWallet({
    databasePath: 'dock-wallet',
    dbType: 'react-native',
    testNetworkId: 'testnet',
    mainNetworkId: 'mainnet',
    documentNetworkResolver: dockDocumentNetworkResolver,
    ...params,
  });

  return wallet;
}
