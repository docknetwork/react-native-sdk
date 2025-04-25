import {
  createTestDataStore,
  createV1EmptyDataStore,
  setupV1MockDataStore,
} from '../../test/test-utils';
import {getV1LocalStorage} from '../migration/migration1/v1-data-store';
import {CURRENT_DATA_STORE_VERSION} from '../migration';
import {DataStore} from '../types';
import {WalletEntity, getWallet} from '../entities/wallet.entity';
import {closeDataStore} from '../index';
import { DEFAULT_CONFIGS } from '../configs';

describe('Data store', () => {
  describe('v2-data-store migration', () => {
    let dataStore: DataStore;

    beforeAll(async () => {
      await setupV1MockDataStore();
      dataStore = await createTestDataStore();
    });

    it('should remove wallet json from local storage', async () => {
      const jsonData = await getV1LocalStorage().getItem('wallet');
      expect(jsonData).toBeUndefined();
    });

    it('should create DataStoreConfigs', async () => {
      const configs = await getWallet({dataStore});
      expect(configs).toBeDefined();
      expect(configs.networkId).toBe('mainnet');
      expect(configs.version).toBe(CURRENT_DATA_STORE_VERSION);
    });

    afterAll(() => {
      closeDataStore(dataStore);
    });
  });

  describe('empty wallet migration', () => {
    let dataStore: DataStore;

    beforeAll(async () => {
      await createV1EmptyDataStore();
      dataStore = await createTestDataStore();
    });

    it('should create SDKConfigs', async () => {
      const configs = await getWallet({dataStore});
      expect(configs.networkId).toBe('mainnet');
      expect(configs.version).toBe(CURRENT_DATA_STORE_VERSION);
    });

    afterAll(() => {
      closeDataStore(dataStore);
    });
  });

  it('should validate regex hostnames correctly', () => {
    const mainnetHostnames = DEFAULT_CONFIGS.networks.find(net => net.id === 'mainnet')?.credentialHostnames || [];
    const testnetHostnames = DEFAULT_CONFIGS.networks.find(net => net.id === 'testnet')?.credentialHostnames || [];

    const mainnetPatterns = mainnetHostnames.filter(host => host instanceof RegExp) as RegExp[];
    const testnetPatterns = testnetHostnames.filter(host => host instanceof RegExp) as RegExp[];


    mainnetPatterns.forEach(regex => {
      expect(regex.test('creds.dock.io')).toBe(true);
      expect(regex.test('creds.example.io')).toBe(true);
      expect(regex.test('invalid.dock.io')).toBe(false);
    });


    testnetPatterns.forEach(regex => {
      expect(regex.test('creds-test.dock.io')).toBe(true);
      expect(regex.test('creds-something.io')).toBe(true);
      expect(regex.test('invalid.io')).toBe(false);
    });
  });
});
