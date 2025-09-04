import {RpcService} from '../rpc-service-client';

export class StorageServiceRpc extends RpcService {
  constructor() {
    super('storage');
  }

  setItem(...args) {
    return this.call('setItem', ...args);
  }

  removeItem(...args) {
    return this.call('removeItem', ...args);
  }

  getItem(...args) {
    return this.call('getItem', ...args);
  }
}
