import {utilCryptoService} from './services/util-crypto/service';
import {walletService} from './services/wallet';

describe('RpcServer', () => {
  it('expect to register walletService', async () => {
    const timestamp = Date.now();
    const result = await walletService.healthCheck(timestamp);
    expect(result).toBe(`wallet: ${timestamp}`);
  });

  it('expect to register utilCrypto', async () => {
    const result = await utilCryptoService.cryptoWaitReady();
    expect(result).toBe(true);
  });
});
