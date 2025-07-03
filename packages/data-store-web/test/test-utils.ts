import {createDataStore} from '../src';
import {DataStore} from '@docknetwork/wallet-sdk-data-store/src/types';


export function createTestDataStore(): Promise<DataStore> {
  return createDataStore({
    dropSchema: true,
    databasePath: ':memory:',
  });
}
