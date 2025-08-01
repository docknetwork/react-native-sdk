import {RpcService} from '../rpc-service-client';
import {serviceName, InitializeEDVParams, validation} from './configs';

export class EDVServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }

  initialize(params: InitializeEDVParams) {
    validation.initialize(params);
    return this.call('initialize', params);
  }

  generateKeys() {
    return this.call('generateKeys');
  }

  deriveKeys() {
    return this.call('deriveKeys');
  }

  getController() {
    return this.call('getController');
  }

  find(params: any) {
    return this.call('find', params);
  }

  update(params: any) {
    return this.call('update', params);
  }

  insert(params: any) {
    return this.call('insert', params);
  }

  delete(params: any) {
    return this.call('delete', params);
  }
}
