import assert from 'assert';
import {decodeAddress, encodeAddress} from '@polkadot/keyring';
import {hexToU8a, isHex} from '@polkadot/util';
import {
  cryptoIsReady,
  cryptoWaitReady,
  keyExtractSuri,
  mnemonicGenerate,
  mnemonicValidate,
} from '@polkadot/util-crypto';

export default {
  name: 'utilCrypto',
  routes: {
    cryptoWaitReady: (...params) => cryptoWaitReady(...params),
    cryptoIsReady: (...params) => cryptoIsReady(...params),
    isAddressValid: address => {
      try {
        encodeAddress(
          isHex(address) ? hexToU8a(address) : decodeAddress(address),
        );

        return true;
      } catch (error) {
        return false;
      }
    },
    mnemonicValidate: (...params) => mnemonicValidate(...params),
    mnemonicGenerate: (...params) => {
      return mnemonicGenerate(...params);
    },
    deriveValidate: uri => {
      assert(!!uri, 'uri is required');

      const {password, path} = keyExtractSuri(uri);
      let result = {};

      assert(path.length, 'invalid derive path');

      // show a warning in case the password contains an unintended / character
      if (password?.includes('/')) {
        result = {warning: 'slash password detected'};
      }

      return result;
    },
  },
};
