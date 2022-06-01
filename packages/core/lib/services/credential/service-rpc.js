import {RpcService} from '../rpc-service-client';
import {serviceName} from './config';

export class CredentialServiceRPC extends RpcService {
  constructor() {
    super(serviceName);
  }
  generateCredential(params) {
    return this.call('generateCredential', params);
  }
  async signCredential(params) {
    return this.call('signCredential', params);
  }
}
