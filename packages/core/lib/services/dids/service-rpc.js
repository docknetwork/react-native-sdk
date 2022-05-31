import {RpcService} from '../rpc-service-client';
import {
  serviceName,
  KeypairToDidKeyDocumentParams,
  GetDidResolutionParams,
} from './config';

export class DIDServiceRPC extends RpcService {
  constructor() {
    super(serviceName);
  }
  keypairToDidKeyDocument(params: KeypairToDidKeyDocumentParams) {
    return this.call('keypairToDidKeyDocument', params);
  }
  getDidResolution(params: GetDidResolutionParams) {
    return this.call('getDidResolution', params);
  }
  generateKeyDoc(params) {
    return this.call('generateKeyDoc', params);
  }
}
