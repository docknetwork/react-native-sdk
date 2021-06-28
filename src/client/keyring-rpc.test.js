import { cryptoWaitReady } from "@polkadot/util-crypto";
import { KeyringRpc } from "./keyring-rpc";
import { UtilCryptoRpc } from "./util-crypto-rpc";

describe("KeyringRpc", () => {
  beforeAll(cryptoWaitReady);

  it("initialize", async () => {
    const result = await KeyringRpc.initialize();
    expect(result).toBe(true);
  });

  it("addFromMnemonic", async () => {
    const mnemonic = await UtilCryptoRpc.mnemonicGenerate();
    const result = await KeyringRpc.addFromMnemonic(mnemonic);
    
    expect(result.address).toBeDefined();
  });
  
  it("addressFromUri", async () => {
    const phrase = "scale hold evidence moment reward garbage spider sign admit omit mimic frame"
    const type = 'sr25519';
    const derivePath = ''
    const address = await KeyringRpc.addressFromUri({
      phrase,
      type,
      derivePath
    });

    expect(address).toBeDefined();
  });
});
