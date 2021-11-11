import {
  cryptoWaitReady,
  cryptoIsReady,
  mnemonicGenerate,
  mnemonicValidate,
  keyExtractSuri,
} from '@polkadot/util-crypto';
import {hexToU8a, isHex} from '@polkadot/util';
import {decodeAddress, encodeAddress} from '@polkadot/keyring';
import {LoggerRpc} from '../client/logger-rpc';

export default {
  name: 'utilCrypto',
  routes: {
    cryptoWaitReady,
    cryptoIsReady,
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
    mnemonicGenerate: (...params) => mnemonicGenerate(...params),
    deriveValidate: uri => {
      const {password, path} = keyExtractSuri(uri);
      let result = {};

      // show a warning in case the password contains an unintended / character
      if (password?.includes('/')) {
        result = {warning: 'WARNING_SLASH_PASSWORD'};
      }

      return result;
    },
  },
};
