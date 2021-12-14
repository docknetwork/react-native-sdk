import service from '../services/dock';
import { mockRpcClient, restoreRpcClient, testRpcEndpoint } from '../test-utils';
import { DockRpc } from './dock-rpc';

describe('DockRpc', () => {
  beforeEach(mockRpcClient);

  it('getAccountBalance', async () => {
    testRpcEndpoint(service, DockRpc.init);
  });

  it('getFeeAmount', async () => {
    testRpcEndpoint(service, DockRpc.setAccount);
  });

  afterAll(restoreRpcClient);
});
