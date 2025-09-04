import {RpcService} from '../rpc-service-client';
import {InitParams} from './configs';

/**
 *
 */
export class BlockchainServiceRpc extends RpcService {
  constructor() {
    super('blockchain');
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
  ensureBlockchainReady(): Promise<any> {
    return this.call('ensureBlockchainReady');
  }

  /**
   *
   */
  init(params: InitParams): Promise<any> {
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

  resolveDID(did: string): Promise<any> {
    return this.call('resolveDID', did);
  }

  getCache(): Promise<any> {
    return this.call('getCache');
  }

  clearCache(did?: string): Promise<any> {
    return this.call('clearCache', did);
  }
}
