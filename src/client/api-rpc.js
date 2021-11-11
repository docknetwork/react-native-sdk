import {rpcRequest} from '../rpc-client';

/** ApiRpc */
export class ApiRpc {
  /**
   * Get account balance from dock network
   * @constructor
   * @param {string} address - Account address
   */
  static getAccountBalance(...params) {
    return rpcRequest('api.getAccountBalance', ...params);
  }

  /**
   * Send tokens
   * @constructor
   * @param {string} recipientAddress - recipientAddress
   * @param {string} accountAddress - accountAddress
   * @param {string} amount - amount
   */
  static sendTokens(...params) {
    return rpcRequest('api.sendTokens', ...params);
  }

  /**
   * Get fee amount
   * @constructor
   * @param {string} recipientAddress - recipientAddress
   * @param {string} accountAddress - accountAddress
   * @param {string} amount - amount
   */
  static getFeeAmount(...params) {
    return rpcRequest('api.getFeeAmount', ...params);
  }
}
