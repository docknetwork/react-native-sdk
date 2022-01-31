import service from '../services/dock';
import {mockRpcClient, restoreRpcClient, testRpcEndpoint} from '../test-utils';
import {DockRpc} from './dock-rpc';

describe('DockRpc', () => {
  beforeEach(mockRpcClient);

  describe('init', () => {
    it('expect to invoke server endpoint', () => {
      testRpcEndpoint(service, DockRpc.init, {address: 'wss://knox-1.dock.io'});
    });

    it('expect to validate params', () => {
      expect(() => DockRpc.init({address: null})).toThrow();
    });
  });

  it('isApiConnected', () => {
    testRpcEndpoint(service, DockRpc.isApiConnected);
  });

  it('disconnect', () => {
    testRpcEndpoint(service, DockRpc.disconnect);
  });

  afterAll(restoreRpcClient);
});
