import {RpcService} from '../rpc-service-client';

export class ExampleServiceRpc extends RpcService {
  constructor() {
    super('example');
  }

  sum(): Promise<any> {
    return this.call('sum');
  }
}
