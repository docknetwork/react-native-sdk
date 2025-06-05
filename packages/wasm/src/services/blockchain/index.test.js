import {NetworkManager} from '../../modules/network-manager';
import {assertRpcService} from '../test-utils';
import {validation} from './configs';
import {blockchainService as service} from './service';
import {BlockchainServiceRpc} from './service-rpc';

describe('DockService', () => {
  it('ServiceRpc', () => {
    assertRpcService(BlockchainServiceRpc, service, validation);
  });

  describe('init', () => {
    it('connect and disconnect substrate node', async () => {
      const result = await service.init({
        cheqdApiUrl: NetworkManager.getInstance().getNetworkInfo().cheqdApiUrl,
      });
      expect(result).toBe(true);
      expect(service.isBlockchainReady).toBeTruthy();
      await service.disconnect();
      expect(service.isBlockchainReady).toBeFalsy();
    });
  });
});
