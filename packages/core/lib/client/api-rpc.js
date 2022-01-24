import {rpcRequest} from '../rpc-client';

export const ApiRpcEndpoints = {
  getAccountBalance: 'api.getAccountBalance',
  sendTokens: 'api.sendTokens',
  getFeeAmount: 'api.getFeeAmount',
};

type TxInput = {
  toAddress: string,
  fromAddress: string,
  amount: string | number,
};

/** ApiRpc */
export class ApiRpc {
  /**
   * Get account balance from dock network
   * @constructor
   * @param {string} address - Account address
   */
  static getAccountBalance(address: string) {
    return rpcRequest(ApiRpcEndpoints.getAccountBalance, address);
  }

  /**
   * Send tokens
   * @constructor
   * @param {string} toAddress - toAddress
   * @param {string} fromAddress - fromAddress
   * @param {string} amount - amount
   */
  static sendTokens(params: TxInput) {
    return rpcRequest(ApiRpcEndpoints.sendTokens, params);
  }

  /**
   * Get fee amount
   * @constructor
   * @param {string} recipientAddress - recipientAddress
   * @param {string} accountAddress - accountAddress
   * @param {string} amount - amount
   */
  static getFeeAmount(params: TxInput) {
    return rpcRequest(ApiRpcEndpoints.getFeeAmount, params);
  }
}
