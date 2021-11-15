import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
  mnemonicValidate,
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
    mnemonicValidate: (...params) => mnemonicValidate(...params),
    mnemonicGenerate: (...params) => mnemonicGenerate(...params),
  },
};
