import {createDataStore} from '../index';
import {
  createV1EmptyDataStore,
  setupV1MockDataStore,
} from '../../test/test-utils';
import {getV1LocalStorage} from '../migration/v2/v1-data-store';
import {getDataSource} from '../typeorm';
import {SDKConfigsEntity} from '../typeorm/entities/sdk-configs.entity';
import {CURRENT_DATA_STORE_VERSION} from '../migration';

describe('Data store', () => {
  describe('v2-data-store migration', () => {
    beforeAll(async () => {
      await setupV1MockDataStore();
      await createDataStore({
        dropSchema: true,
      });
    });

    it('should remove wallet json from local storage', async () => {
      const jsonData = await getV1LocalStorage().getItem('wallet');
      expect(jsonData).toBeUndefined();
    });

    it('should create SDKConfigs', async () => {
      const sdkConfigs = await getDataSource()
        .getRepository(SDKConfigsEntity)
        .find();
      expect(sdkConfigs.length).toBe(1);
      expect(sdkConfigs[0].activeWallet).toBe('mainnet');
      expect(sdkConfigs[0].version).toBe(CURRENT_DATA_STORE_VERSION);
    });
  });

  describe('empty wallet migration', () => {
    beforeAll(async () => {
      await createV1EmptyDataStore();
      await createDataStore({
        dropSchema: true,
      });
    });

    it('should create SDKConfigs', async () => {
      const sdkConfigs = await getDataSource()
        .getRepository(SDKConfigsEntity)
        .find();
      expect(sdkConfigs.length).toBe(1);
      expect(sdkConfigs[0].activeWallet).toBe('mainnet');
      expect(sdkConfigs[0].version).toBe(CURRENT_DATA_STORE_VERSION);
    });
  });
});
