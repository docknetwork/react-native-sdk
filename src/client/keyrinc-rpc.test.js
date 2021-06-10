import { KeyringRpc } from "./keyring-rpc";
import { UtilCryptoRpc } from "./util-crypto-rpc";

describe("KeyringRpc", () => {
  it("initialize", async () => {
    const result = await KeyringRpc.initialize();
    expect(result).toBe(true);
  });

  it("addFromMnemonic", async () => {
    const mnemonic = await UtilCryptoRpc.mnemonicGenerate();
    const result = await KeyringRpc.addFromMnemonic(mnemonic);
    expect(result.address).toBeDefined();
  });
});
