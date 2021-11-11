import {rpcRequest} from '../rpc-client';

/** KeyringRpc */
export class KeyringRpc {
  /**
   * Initialize KeyringRpc
   * @param {object} options
   * @returns {boolean}
   */
  static initialize(...params) {
    return rpcRequest('keyring.initialize', ...params);
  }

  /**
   * Add from mnemonic
   * @param {string} params - params
   */
  static addFromMnemonic(...options) {
    return rpcRequest('keyring.addFromMnemonic', ...options);
  }

  /**
   * Add from json
   * @param {string} params - params
   */
  static addFromJson(...params) {
    return rpcRequest('keyring.addFromJson', ...params);
  }

  /**
   * Crypto is ready
   * @returns boolean
   */
  static cryptoIsReady() {
    return rpcRequest('utilCrypto.cryptoIsReady');
  }

  /**
   * Address from Uri
   * @param {string} params - params
   */
  static addressFromUri(...params) {
    return rpcRequest('keyring.addressFromUri', ...params);
  }
}

/** KeyringPairRpc */
export class KeyringPairRpc {
  /**
   * Unlock keypair
   * @param {string} params - params
   */
  static unlock(...params) {
    return rpcRequest('pair.unlock', ...params);
  }

  /**
   * Get keypair address
   * @returns {string} address
   */
  static address() {
    return rpcRequest('pair.address');
  }

  /**
   * Check lock status
   * @returns {boolean} locked status
   */
  static isLocked() {
    return rpcRequest('pair.isLocked');
  }

  /**
   * Lock keypair
   */
  static lock() {
    return rpcRequest('pair.lock');
  }

  /**
   * Export keypair to json
   * @param {string} string - password
   * @returns {object} account json
   */
  static toJson(password) {
    return rpcRequest('pair.toJson', password);
  }
}
