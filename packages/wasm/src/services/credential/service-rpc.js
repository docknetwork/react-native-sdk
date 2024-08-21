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
  async deriveVCFromPresentation(params) {
    return this.call('deriveVCFromPresentation', params);
  }
  async isBBSPlusCredential(params) {
    return this.call('isBBSPlusCredential', params);
  }
  async isKvacCredential(params) {
    return this.call('isKvacCredential', params);
  }
  async getAccumulatorId(params) {
    return this.call('getAccumulatorId', params);
  }
  async acequireOIDCredential(params) {
    return this.call('acequireOIDCredential', params);
  }
}
