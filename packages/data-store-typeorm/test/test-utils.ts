import {createMockLocalStorage} from './mock-local-storage';
import walletJSON from './wallet.json';
import {setV1LocalStorage} from '../src/migration/migration1/v1-data-store';
import {createDataStore} from '../src';
import {DataStore} from '@docknetwork/wallet-sdk-data-store/src/types';

export async function setupV1MockDataStore(): Promise<void> {
  const mockLocalStorage = createMockLocalStorage();
  setV1LocalStorage(mockLocalStorage);
  await mockLocalStorage.setItem('wallet', JSON.stringify(walletJSON));
}

export async function createV1EmptyDataStore() {
  const mockLocalStorage = createMockLocalStorage();
  setV1LocalStorage(mockLocalStorage);
}

export function createTestDataStore(): Promise<DataStore> {
  return createDataStore({
    dropSchema: true,
    databasePath: ':memory:',
  });
}
