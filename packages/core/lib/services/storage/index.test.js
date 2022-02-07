import {StorageService, storageService as service} from './service';
import {StorageServiceRpc} from './service-rpc';
import {NetworkManager} from '../../modules/network-manager';
import {
  assertRpcService,
  getPromiseError,
  mockDockSdkConnection,
} from '../test-utils';
import {validation} from './configs';

global.localStorage = {
  setItem: jest.fn(),
};

describe('StorageService', () => {
  it('ServiceRpc', () => {
    assertRpcService(StorageServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {});

    describe('setItem', () => {
      it('expect to setItem', async () => {
        const data = 2;
        const result = await service.setItem(data);
        expect(global.localStorage.setItem).toBeCalledWith(data);
      });
    });
  });
});
