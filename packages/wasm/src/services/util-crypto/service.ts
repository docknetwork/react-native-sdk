// @ts-nocheck
import {decodeAddress, encodeAddress} from '@polkadot/keyring';
import {hexToU8a, isHex} from '@polkadot/util';
import {
  cryptoIsReady,
  cryptoWaitReady,
  keyExtractSuri,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from '@polkadot/util-crypto';
import assert from 'assert';
import {validation} from './configs';

export class UtilCryptoService {
  rpcMethods = [
    UtilCryptoService.prototype.mnemonicGenerate,
    UtilCryptoService.prototype.mnemonicToMiniSecret,
    UtilCryptoService.prototype.mnemonicValidate,
    UtilCryptoService.prototype.cryptoWaitReady,
    UtilCryptoService.prototype.cryptoIsReady,
    UtilCryptoService.prototype.isAddressValid,
    UtilCryptoService.prototype.deriveValidate,
    UtilCryptoService.prototype.isBase64,
    UtilCryptoService.prototype.getAddressPrefix,
  ];

  constructor() {
    this.name = 'utilCrypto';
  }

  mnemonicGenerate(numWords) {
    validation.mnemonicGenerate(numWords);

    return mnemonicGenerate(numWords);
  }

  mnemonicToMiniSecret(phrase) {
    validation.mnemonicToMiniSecret(phrase);

    return mnemonicToMiniSecret(phrase);
  }

  isBase64(value) {
    if (typeof value !== 'string') {
      return false;
    }

    const decoded1 = Buffer.from(value, 'base64').toString('utf8');
    const encoded2 = Buffer.from(decoded1, 'binary').toString('base64');
    return value === encoded2;
  }

  mnemonicValidate(phrase) {
    validation.mnemonicValidate(phrase);

    return mnemonicValidate(phrase);
  }

  cryptoWaitReady() {
    return cryptoWaitReady();
  }

  cryptoIsReady(...args) {
    return cryptoIsReady();
  }

  getAddressPrefix(params) {
    const {address, startPrefix, endPrefix} = params;

    for (let prefix = startPrefix; prefix <= endPrefix; prefix++) {
      try {
        const decoded = decodeAddress(address);
        const reencoded = encodeAddress(decoded, prefix);

        if (reencoded === address) {
          return prefix;
        }
      } catch (err) {
        // Ignore invalid prefixes
      }
    }

    return null;
  }

  isAddressValid(address) {
    validation.isAddressValid(address);

    try {
      encodeAddress(
        isHex(address) ? hexToU8a(address) : decodeAddress(address),
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  deriveValidate(uri: string) {
    validation.deriveValidate(uri);

    const {password, path} = keyExtractSuri(uri);
    let result = {};

    assert(path.length, 'invalid derive path');

    // show a warning in case the password contains an unintended / character
    if (password && password.includes('/')) {
      result = {warning: 'slash password detected'};
    }

    return result;
  }
}

export const utilCryptoService: UtilCryptoService = new UtilCryptoService();
