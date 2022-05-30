import {RpcService} from '../rpc-service-client';
import {serviceName} from './config';

export class DIDServiceRPC extends RpcService {
  constructor() {
    super(serviceName);
  }
  keypairToDidKeyDocument(params) {
    return this.call('keypairToDidKeyDocument', params);
  }
  getDidResolution(params) {
    return this.call('getDidResolution', params);
  }
  generateKeyDoc(params) {
    return this.call('generateKeyDoc', params);
  }
}
