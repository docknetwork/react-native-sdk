import {rpcRequest} from '../rpc-client';

/** UtilCryptoRpc */
export class UtilCryptoRpc {
  /**
   * Wait crypto ready
   * @returns {void}
   */
  static cryptoWaitReady() {
    return rpcRequest('utilCrypto.cryptoWaitReady');
  }

  /**
   * Check if crypto is ready
   * @returns {boolean} crypto ready status
   */
  static cryptoIsReady() {
    return rpcRequest('utilCrypto.cryptoIsReady');
  }

  /**
   * Generate mnemonic phrase
   * @params {object} params
   * @returns {string} mnemonic
   */
  static mnemonicGenerate(...params) {
    return rpcRequest('utilCrypto.mnemonicGenerate', ...params);
  }

  /**
   * Validate mnemonic phrase
   * @params {object} params
   * @returns {boolean} is valid
   */
  static mnemonicValidate(...params) {
    return rpcRequest('utilCrypto.mnemonicValidate', ...params);
  }

  /**
   * Validate account address
   * @params {string} address
   * @returns {boolean} is valid
   */
  static isAddressValid(...params) {
    return rpcRequest('utilCrypto.isAddressValid', ...params);
  }
}
