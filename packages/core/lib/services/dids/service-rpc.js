import {RpcService} from '../rpc-service-client';

export class DIDServiceRPC extends RpcService {
  constructor() {
    super('didManager');
  }
  keypairToDidKeyDocument(params) {
    return this.call('keypairToDidKeyDocument', params);
  }
}
