import {RpcService} from '../rpc-service-client';
import {serviceName} from './configs';

export class TrustRegistryServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }
  
  async getTrustRegistries(params) {
    return this.call('getTrustRegistries', params);
  }
  async getTrustRegistryVerifiers(params) {
    return this.call('getTrustRegistryVerifiers', params);
  }
}
