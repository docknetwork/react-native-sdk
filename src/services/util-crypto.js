import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
} from "@polkadot/util-crypto";
import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { LoggerRpc } from "../client/logger-rpc";

export default {
  name: "utilCrypto",
  routes: {
    cryptoWaitReady,
    cryptoIsReady,
    isAddressValid: (address) => {
      try {
        encodeAddress(
          isHex(address)
            ? hexToU8a(address)
            : decodeAddress(address)
        );
    
        return true;
      } catch (error) {
        return false;
      }
    },
    mnemonicGenerate: (...params) => mnemonicGenerate(...params),
  },
};
