import { UtilCryptoRpc } from "./util-crypto-rpc";

describe('UtilCryptoRpc', () => {
  it('cryptoIsReady', async () => {
    const result = await UtilCryptoRpc.cryptoIsReady();
    expect(result).toBe(false);
  });
  
  it('cryptoWaitReady', async () => {
    await UtilCryptoRpc.cryptoWaitReady();
    const result = await UtilCryptoRpc.cryptoIsReady();
    expect(result).toBe(true);
  });
  
  // it('mnemonicGenerate', async () => {
  //   await UtilCryptoRpc.cryptoWaitReady();
    
  //   const result = await UtilCryptoRpc.mnemonicGenerate();
  //   console.log('Mnemonic generated:', result);
  //   expect(result).toBeDefined();
  // });
  
  
});
