import {rpcRequest} from '../rpc-client';

export class DockRpc {

  static init(...params) {
    return rpcRequest('dock.init', ...params);
  }

  static setAccount(...params) {
    return rpcRequest('dock.setAccount', ...params);
  }
  
  static disconnect(...params) {
    return rpcRequest('dock.disconnect', ...params);
  }
}
