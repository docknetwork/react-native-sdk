import service from '../services/keyring';
import {mockRpcClient, restoreRpcClient, testRpcEndpoint} from '../test-utils';
import {KeyringRpc} from './keyring-rpc';

describe('KeyringRpc', () => {
  beforeEach(mockRpcClient);

  it('addFromJson', async () => {
    testRpcEndpoint(service, KeyringRpc.addFromJson);
  });

  it('initialize', async () => {
    testRpcEndpoint(service, KeyringRpc.initialize);
  });

  it('addFromMnemonic', async () => {
    testRpcEndpoint(service, KeyringRpc.addFromMnemonic);
  });

  it('addressFromUri', async () => {
    testRpcEndpoint(service, KeyringRpc.addressFromUri);
  });

  afterAll(restoreRpcClient);
});
