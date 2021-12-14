import {rpcRequest} from '../rpc-client';

/** DockRpc */
export class DockRpc {
  /**
   * Initialize dock sdk
   * @constructor
   * @param {string} address - substrate url
   */
  static init(...params) {
    return rpcRequest('dock.init', ...params);
  }

  /**
   * Initialize dock sdk
   * @constructor
   * @param {string} address - substrate url
   */
   static isApiConnected(...params) {
    return rpcRequest('dock.isApiConnected', ...params);
  }


  /**
   * Set current account in the sdk
   * @constructor
   * @param {string} address - account address
   */
  static setAccount(...params) {
    return rpcRequest('dock.setAccount', ...params);
  }
}
