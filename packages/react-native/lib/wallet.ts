import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {dockDocumentNetworkResolver} from '@docknetwork/wallet-sdk-core/src/network-resolver';
import {DataStoreConfigs} from '@docknetwork/wallet-sdk-data-store/lib/types';

let wallet: IWallet;

export function getWallet() {
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }

  return wallet;
}

export function setWallet(_wallet: IWallet) {
  wallet = _wallet;
}

export async function getOrCreateWallet(params: DataStoreConfigs = {} as any) {
  if (!wallet) {
    await initializeWallet(params);
  }

  return wallet;
}
export async function initializeWallet(params: DataStoreConfigs = {} as any) {
  const _wallet = await createWallet({
    databasePath: 'dock-wallet',
    dbType: 'react-native',
    testNetworkId: 'testnet',
    mainNetworkId: 'mainnet',
    documentNetworkResolver: dockDocumentNetworkResolver,
    ...params,
  });

  setWallet(_wallet);

  return _wallet;
}
