import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
} from "@polkadot/util-crypto";

describe('UtilCryptoRpc', () => {

  it('mnemonicGenerate', async () => {
    await cryptoWaitReady();
    const result = mnemonicGenerate();
    
    expect(typeof result).toBe('string');
  })
});
