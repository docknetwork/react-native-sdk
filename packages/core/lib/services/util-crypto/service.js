import assert from 'assert';
import {EventEmitter, once} from 'events';
import {decodeAddress, encodeAddress} from '@polkadot/keyring';
import {hexToU8a, isHex} from '@polkadot/util';
import {
  cryptoIsReady,
  cryptoWaitReady,
  keyExtractSuri,
  mnemonicGenerate,
  mnemonicValidate,
} from '@polkadot/util-crypto';
import {validation, SumParams} from './configs';

export class UtilCryptoService {

  rpcMethods = [
    UtilCryptoService.prototype.mnemonicGenerate,
    UtilCryptoService.prototype.mnemonicValidate,
    UtilCryptoService.prototype.cryptoWaitReady,
    UtilCryptoService.prototype.cryptoIsReady,
    UtilCryptoService.prototype.isAddressValid,
    UtilCryptoService.prototype.deriveValidate,
  ];

  constructor() {
    this.name = 'utilCrypto';
  }

  mnemonicGenerate(numWords) {
    validation.mnemonicGenerate(numWords);

    return mnemonicGenerate(numWords)
  }
  
  mnemonicValidate(phrase) {
    validation.mnemonicValidate(phrase);

    return mnemonicValidate(phrase)
  }
  
  cryptoWaitReady() {
    return cryptoWaitReady()
  }
  
  cryptoIsReady(...args) {
    return cryptoIsReady()
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
    if (password?.includes('/')) {
      result = {warning: 'slash password detected'};
    }

    return result;
  }
}


export const utilcryptoService:UtilCryptoService = new UtilCryptoService();

