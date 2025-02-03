import {NetworkManager} from '../../modules/network-manager';
import {assertRpcService, mockDockSdkConnection} from '../test-utils';
import {validation} from './configs';
import {blockchainService as service} from './service';
import {BlockchainServiceRpc} from './service-rpc';

const doConnect = (
  address = NetworkManager.getInstance().getNetworkInfo().substrateUrl,
) =>
  service.init({
    address,
  });

describe('DockService', () => {
  it('ServiceRpc', () => {
    assertRpcService(BlockchainServiceRpc, service, validation);
  });

  describe('init', () => {
    afterEach(async () => {
      await service.disconnect();
    });

    it('connect and disconnect substrate node', async () => {
      const mock = mockDockSdkConnection();
      const result = await doConnect();
      expect(result).toBe(true);
      expect(await service.isApiConnected()).toBeTruthy();
      await service.disconnect();
      expect(await service.isApiConnected()).toBeFalsy();
      mock.clear();
    });
  });
});
