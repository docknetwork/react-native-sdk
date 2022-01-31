import {assert} from '../core/validation';
import {rpcRequest} from '../rpc-client';

/** DockRpc */
export class DockRpc {
  /**
   * Initialize dock sdk
   * @constructor
   * @param {string} address - substrate url
   */
  static init({address}) {
    assert(address, 'substrate url is required');
    return rpcRequest('dock.init', {address});
  }

  /**
   * Check api connection status
   * @constructor
   * @param {string} address - substrate url
   */
  static isApiConnected() {
    return rpcRequest('dock.isApiConnected');
  }

  /**
   * Disconnect dock
   * @constructor
   * @param {string} address - account address
   */
  static disconnect() {
    return rpcRequest('dock.disconnect');
  }
}
