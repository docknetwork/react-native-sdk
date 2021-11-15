import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
} from "@polkadot/util-crypto";
import UtilCrypto from "./util-crypto";

describe("UtilCryptoRpc", () => {
  beforeAll(async () => {
    await cryptoWaitReady();
  });
  it("mnemonicGenerate", () => {
    const result = UtilCrypto.routes.mnemonicGenerate(12);
    expect(typeof result).toBe("string");
  });

  it("isAddressValid", () => {
    const isValid = UtilCrypto.routes.isAddressValid(
      "3HM9DYxHe5tAwh2cuErNHiLxSMDJhetxaVGCDTYXiwyuuHN6"
    );

    expect(isValid).toBe(true);
  });

  describe("mnemonicValidate", () => {
    it("expect mnemonic to be valid", () => {
      const phrase = UtilCrypto.routes.mnemonicGenerate(12);
      const isValid = UtilCrypto.routes.mnemonicValidate(phrase);

      expect(isValid).toBe(true);
    });

    it("expect mnemonic to be invalid", () => {
      const isValid = UtilCrypto.routes.mnemonicValidate("invalid mnemonic");

      expect(isValid).toBe(false);
    });
  });
});
