import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
} from "@polkadot/util-crypto";
import { LoggerRpc } from "../client/logger-rpc";

export default {
  name: "utilCrypto",
  routes: {
    cryptoWaitReady,
    cryptoIsReady,
    mnemonicGenerate: () => mnemonicGenerate(),
  },
};
