import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
} from "@polkadot/util-crypto";

export default {
  name: "utilCrypto",
  routes: [cryptoWaitReady, cryptoIsReady, mnemonicGenerate],
};
