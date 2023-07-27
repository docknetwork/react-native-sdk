import {RpcService} from '../rpc-service-client';
import {InitParams, validation} from './configs';

/**
 *
 */
export class DockServiceRpc extends RpcService {
  constructor() {
    super('dock');
  }

  /**
   *
   */
  disconnect(): Promise<any> {
    return this.call('disconnect');
  }

  /**
   *
   */
  ensureDockReady(): Promise<any> {
    return this.call('ensureDockReady');
  }

  /**
   *
   */
  init(params: InitParams): Promise<any> {
    validation.init(params);
    return this.call('init', params);
  }

  /**
   *
   */
  isApiConnected(): Promise<any> {
    return this.call('isApiConnected');
  }

  getAddress(): Promise<string> {
    return this.call('getAddress');
  }
}
