import service from '../services/api';
import {mockRpcClient, restoreRpcClient, testRpcEndpoint} from '../test-utils';
import {ApiRpc} from './api-rpc';

describe('ApiRpc', () => {
  beforeEach(mockRpcClient);

  it('getAccountBalance', async () => {
    testRpcEndpoint(service, ApiRpc.getAccountBalance);
  });

  it('getFeeAmount', async () => {
    testRpcEndpoint(service, ApiRpc.getFeeAmount);
  });

  it('sendTokens', async () => {
    testRpcEndpoint(service, ApiRpc.sendTokens);
  });

  afterAll(restoreRpcClient);
});
