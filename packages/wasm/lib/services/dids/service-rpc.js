import {RpcService} from '../rpc-service-client';
import {
  serviceName,
  KeypairToDIDKeyDocumentParams,
  GetDIDResolutionParams,
} from './config';

export class DIDServiceRPC extends RpcService {
  constructor() {
    super(serviceName);
  }
  keypairToDIDKeyDocument(params: KeypairToDIDKeyDocumentParams) {
    return this.call('keypairToDIDKeyDocument', params);
  }
  getDIDResolution(params: GetDIDResolutionParams) {
    return this.call('getDIDResolution', params);
  }
  generateKeyDoc(params) {
    return this.call('generateKeyDoc', params);
  }
  registerDidDock(keyPair) {
    return this.call('registerDidDock', keyPair);
  }
  getDidDockDocument(did) {
    return this.call('getDidDockDocument', did);
  }
  generateDIDDockKeyDoc(params) {
    return this.call('generateDIDDockKeyDoc', params);
  }
}
