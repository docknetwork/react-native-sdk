import {createMockLocalStorage} from './mock-local-storage';
import walletJSON from './wallet.json';
import {setV1LocalStorage} from '../src/migration/v2/v1-data-store';
import {createDataStore} from "../src";

export const setupV1MockDataStore = async () => {
  const mockLocalStorage = createMockLocalStorage();
  setV1LocalStorage(mockLocalStorage);
  await mockLocalStorage.setItem('wallet', JSON.stringify(walletJSON));
};

export const createV1EmptyDataStore = async () => {
  const mockLocalStorage = createMockLocalStorage();
  setV1LocalStorage(mockLocalStorage);
};

export const createTestDataStore() {
  return createDataStore({
    dropSchema: true,
    databasePath: ':memory:',
  });
}
