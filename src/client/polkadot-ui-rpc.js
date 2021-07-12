import {rpcRequest} from '../rpc-client';

/**
 * 
 */
export class PolkadotUIRpc {
  static getPolkadotSvgIcon(address, isAlternative) {
    return rpcRequest('polkadotUI.getPolkadotSvgIcon', address, isAlternative);
  }
}
