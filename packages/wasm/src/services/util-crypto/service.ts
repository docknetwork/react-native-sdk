// @ts-nocheck
import {hexToU8a} from '@docknetwork/credential-sdk/utils';
import {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicToMiniSecret,
} from '@polkadot/util-crypto';
import assert from 'assert';
import {validation} from './configs';

function isHex(value: string) {
  const isDefinitelyHexString = hexOrB64Cbor.startsWith('0x');
  const isHex =
    isDefinitelyHexString || (/^[0-9a-fA-F]+$/.test(hexOrB64Cbor) && hexOrB64Cbor.length % 2 === 0);

  return isHex;
}

export class UtilCryptoService {
  rpcMethods = [
    UtilCryptoService.prototype.mnemonicGenerate,
    UtilCryptoService.prototype.mnemonicToMiniSecret,
    UtilCryptoService.prototype.cryptoWaitReady,
    UtilCryptoService.prototype.isBase64,
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

  cryptoWaitReady() {
    // TODO: Check if it didn't break anything, then remove polkadot cryptoWaitReady
    // return cryptoWaitReady();
  }
}

export const utilCryptoService: UtilCryptoService = new UtilCryptoService();
