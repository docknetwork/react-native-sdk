import {rpcRequest} from '../rpc-client';
import {assertAddress, assertTokenAmount} from '../core/validation';

export const ApiRpcEndpoints = {
  getAccountBalance: 'api.getAccountBalance',
  sendTokens: 'api.sendTokens',
  getFeeAmount: 'api.getFeeAmount',
};

export type TxInput = {
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
    assertAddress(address);
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
    assertAddress(params.fromAddress, 'fromAddress');
    assertAddress(params.toAddress, 'toAddress');
    assertTokenAmount(params.amount);

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
    assertAddress(params.fromAddress, 'fromAddress');
    assertAddress(params.toAddress, 'toAddress');
    assertTokenAmount(params.amount);

    return rpcRequest(ApiRpcEndpoints.getFeeAmount, params);
  }
}
