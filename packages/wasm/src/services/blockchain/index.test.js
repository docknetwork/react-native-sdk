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

  describe('resolveDID', () => {
    it('should resolve did and store in cache', async () => {
      const did = 'did:cheqd:testnet:c0890f1c-c7bb-4ea6-be7a-8c31404743b7';
      const result = await service.resolveDID(did);
      expect(result).toBeDefined();
      expect(service.resolver.cache.get(did)).toBeDefined();
      expect(service.resolver.cache.get(did).didDocument).toBeDefined();
      expect(service.resolver.cache.get(did).didDocument.id).toBe(did);
      expect(service.resolver.cache.get(did).didDocument.controller).toBe(did);
    });
  });
});
