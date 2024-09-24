import {localStorageJSON} from '../localStorageJSON';
import {ContextProps} from '@docknetwork/wallet-sdk-data-store/src/types';

export interface WalletEntity {
  id: string;
  version?: string;
  networkId: string;
}

export async function getWallet({
  dataStore,
}: ContextProps): Promise<WalletEntity> {
  const result = await localStorageJSON.getItem('wallet');
  return result;
}

export function createWallet({dataStore}: ContextProps): Promise<WalletEntity> {
  return localStorageJSON.setItem('wallet', {
    id: 'configs',
    ...dataStore,
  });
}

export function updateWallet({dataStore}: ContextProps): Promise<WalletEntity> {
  return localStorageJSON.setItem('wallet', {
    id: 'configs',
    ...dataStore,
  });
}
