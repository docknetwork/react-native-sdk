import {RpcService} from '../rpc-service-client';

export class StorageServiceRpc extends RpcService {
  constructor() {
    super('storage');
  }

  setItem(...args): Promise<any> {
    return this.call('setItem', ...args);
  }

  removeItem(...args): Promise<any> {
    return this.call('removeItem', ...args);
  }

  getItem(...args): Promise<any> {
    return this.call('getItem', ...args);
  }
}
