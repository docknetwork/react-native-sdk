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
  async createPresentation(params) {
    return this.call('createPresentation', params);
  }
  async verifyCredential(params) {
    return this.call('verifyCredential', params);
  }
  async createBBSPresentation(params) {
    return this.call('createBBSPresentation', params);
  }
  async filterCredentials(params) {
    return this.call('filterCredentials', params);
  }
  async evaluatePresentation(params) {
    return this.call('evaluatePresentation', params);
  }
}
