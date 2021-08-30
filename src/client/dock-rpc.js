import {rpcRequest} from '../rpc-client';

export class DockRpc {

  static init(...params) {
    return rpcRequest('dock.init', ...params);
  }

  static setAccount(...params) {
    return rpcRequest('dock.setAccount', ...params);
  }
}
