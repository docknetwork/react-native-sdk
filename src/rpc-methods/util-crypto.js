import { cryptoWaitReady, cryptoIsReady, mnemonicGenerate } from "@polkadot/util-crypto";
import { generateMethods } from "../rpc-util";

export default generateMethods({
  parent: "utilCrypto",
  methodList: [cryptoWaitReady, cryptoIsReady, mnemonicGenerate],
});
