import service from '../services/wallet';
import {mockRpcClient, restoreRpcClient, testRpcEndpoint} from '../test-utils';
import {WalletRpc} from './wallet-rpc';

describe('WalletRpc', () => {
  beforeEach(mockRpcClient);

  it('create', async () => {
    testRpcEndpoint(service, WalletRpc.create);
  });

  it('load', async () => {
    testRpcEndpoint(service, WalletRpc.load);
  });

  it('sync', async () => {
    testRpcEndpoint(service, WalletRpc.sync);
  });

  it('lock', async () => {
    testRpcEndpoint(service, WalletRpc.lock);
  });

  it('unlock', async () => {
    testRpcEndpoint(service, WalletRpc.unlock);
  });

  it('status', async () => {
    testRpcEndpoint(service, WalletRpc.status);
  });

  it('toJSON', async () => {
    testRpcEndpoint(service, WalletRpc.toJSON);
  });

  it('add', async () => {
    testRpcEndpoint(service, WalletRpc.add);
  });

  it('remove', async () => {
    testRpcEndpoint(service, WalletRpc.remove);
  });

  it('update', async () => {
    testRpcEndpoint(service, WalletRpc.update);
  });

  it('query', async () => {
    testRpcEndpoint(service, WalletRpc.query);
  });
  it('getStorageDocument', async () => {
    testRpcEndpoint(service, WalletRpc.getStorageDocument);
  });

  it('exportWallet', async () => {
    testRpcEndpoint(service, WalletRpc.exportWallet);
  });

  it('exportAccount', async () => {
    testRpcEndpoint(service, WalletRpc.exportAccount);
  });

  it('importWallet', async () => {
    testRpcEndpoint(service, WalletRpc.importWallet);
  });

  afterAll(restoreRpcClient);
});
