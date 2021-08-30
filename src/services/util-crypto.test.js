import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
} from "@polkadot/util-crypto";
import UtilCrypto from "./util-crypto";

describe("UtilCryptoRpc", () => {
  it("mnemonicGenerate", async () => {
    await cryptoWaitReady();
    const result = mnemonicGenerate();

    expect(typeof result).toBe("string");
  });

  it("isAddressValid", async () => {
    await cryptoWaitReady();
    const isValid = UtilCrypto.routes.isAddressValid(
      "3HM9DYxHe5tAwh2cuErNHiLxSMDJhetxaVGCDTYXiwyuuHN6"
    );

    expect(isValid).toBe(true);
  });
});
