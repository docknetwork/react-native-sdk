import {utilCryptoService} from './services/util-crypto/service';

describe('RpcServer', () => {
  it('expect to register utilCrypto', async () => {
    const result = await utilCryptoService.mnemonicGenerate(12);
    expect(result).toBeDefined();
  });
});
