import service from '../services/util-crypto';
import {mockRpcClient, restoreRpcClient, testRpcEndpoint} from '../test-utils';
import {UtilCryptoRpc} from './util-crypto-rpc';

describe('UtilCryptoRpc', () => {
  beforeEach(mockRpcClient);

  it('cryptoWaitReady', async () => {
    testRpcEndpoint(service, UtilCryptoRpc.cryptoWaitReady);
  });

  it('cryptoIsReady', async () => {
    testRpcEndpoint(service, UtilCryptoRpc.cryptoIsReady);
  });

  it('mnemonicGenerate', async () => {
    testRpcEndpoint(service, UtilCryptoRpc.mnemonicGenerate);
  });

  it('mnemonicValidate', async () => {
    testRpcEndpoint(service, UtilCryptoRpc.mnemonicValidate);
  });

  it('isAddressValid', async () => {
    testRpcEndpoint(service, UtilCryptoRpc.isAddressValid);
  });

  afterAll(restoreRpcClient);
});
