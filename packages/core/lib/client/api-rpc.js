import {rpcRequest} from '../rpc-client';

export const ApiRpcEndpoints = {
  getAccountBalance: 'api.getAccountBalance',
  sendTokens: 'api.sendTokens',
  getFeeAmount: 'api.getFeeAmount',
};

/** ApiRpc */
export class ApiRpc {
  /**
   * Get account balance from dock network
   * @constructor
   * @param {string} address - Account address
   */
  static getAccountBalance(...params) {
    return rpcRequest(ApiRpcEndpoints.getAccountBalance, ...params);
  }

  /**
   * Send tokens
   * @constructor
   * @param {string} recipientAddress - recipientAddress
   * @param {string} accountAddress - accountAddress
   * @param {string} amount - amount
   */
  static sendTokens(...params) {
    return rpcRequest(ApiRpcEndpoints.sendTokens, ...params);
  }

  /**
   * Get fee amount
   * @constructor
   * @param {string} recipientAddress - recipientAddress
   * @param {string} accountAddress - accountAddress
   * @param {string} amount - amount
   */
  static getFeeAmount(...params) {
    return rpcRequest(ApiRpcEndpoints.getFeeAmount, ...params);
  }
}
