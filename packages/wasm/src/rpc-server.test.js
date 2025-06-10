import {utilCryptoService} from './services/util-crypto/service';

describe('RpcServer', () => {
  it('expect to register utilCrypto', async () => {
    const result = await utilCryptoService.cryptoWaitReady();
    expect(result).toBe(true);
  });
});
