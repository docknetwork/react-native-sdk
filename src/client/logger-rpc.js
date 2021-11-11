import {getLogger} from '../logger';
import {rpcRequest} from '../rpc-client';

/** LoggerRpc */
export class LoggerRpc {
  /**
   * Debug utility for json rpc
   * @param {object} params - log params
   */
  static log(...params) {
    return rpcRequest('logger.log', ...params);
  }
}
