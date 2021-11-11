import {rpcRequest} from '../rpc-client';

/** StorageRpc */
export class StorageRpc {
  /**
   * Get item
   * @param {object} params - params
   */
  static getItem(...params) {
    return rpcRequest('storage.getItem', ...params);
  }
  /**
   * Set item
   * @param {object} params - params
   */
  static setItem(...params) {
    return rpcRequest('storage.setItem', ...params);
  }
  /**
   * Remove item
   * @param {object} params - params
   */
  static removeItem(...params) {
    return rpcRequest('storage.removeItem', ...params);
  }
}
