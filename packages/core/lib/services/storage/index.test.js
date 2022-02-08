import {assertRpcService} from '../test-utils';
import {validation} from './configs';
import {storageService as service} from './service';
import {StorageServiceRpc} from './service-rpc';

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
        await service.setItem(data);
        expect(global.localStorage.setItem).toBeCalledWith(data);
      });
    });
  });
});
