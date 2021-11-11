import {rpcRequest} from '../rpc-client';

/** PolkadotUIRpc */
export class PolkadotUIRpc {
  /**
   * Debug utility for json rpc
   * @param {object} params - log params
   * @returns {object} svg data
   */
  static getPolkadotSvgIcon(address, isAlternative) {
    return rpcRequest('polkadotUI.getPolkadotSvgIcon', address, isAlternative);
  }
}
