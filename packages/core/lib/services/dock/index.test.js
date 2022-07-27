import {NetworkManager} from '../../modules/network-manager';
import {
  assertRpcService,
  getPromiseError,
  mockDockSdkConnection,
} from '../test-utils';
import {validation} from './configs';
import {dockService as service} from './service';
import {DockServiceRpc} from './service-rpc';

const doConnect = (
  address = NetworkManager.getInstance().getNetworkInfo().substrateUrl,
) =>
  service.init({
    address,
  });

describe('DockService', () => {
  it('ServiceRpc', () => {
    assertRpcService(DockServiceRpc, service, validation);
  });

  describe('init', () => {
    afterEach(async () => {
      await service.disconnect();
    });

    it('connect and disconnect substrate node', async () => {
      const mock = mockDockSdkConnection();
      const result = await doConnect();
      expect(result).toBe(mock.result);
      expect(await service.isApiConnected()).toBeTruthy();
      await service.disconnect();
      expect(await service.isApiConnected()).toBeFalsy();
      mock.clear();
    });

    it('throw error for invalid address', async () => {
      const mock = mockDockSdkConnection();
      const error = await getPromiseError(async () => {
        await doConnect(null);
      });
      expect(error.message).toBe('invalid substrate address null');
      expect(await service.isApiConnected()).toBeFalsy();
      mock.clear();
    });

    it('throw error for existing connection', async () => {
      const mock = mockDockSdkConnection();
      const error = await getPromiseError(async () => {
        await doConnect();
        await doConnect();
      });
      expect(error.message).toBe('dock is already initialized');
      mock.clear();
    });
  });
});
