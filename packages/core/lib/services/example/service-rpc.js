import {RpcService} from '../rpc-service-client';
import {validation, InitParams} from './configs';

export class ExampleServiceRpc extends RpcService {
  constructor() {
    super('example');
  }

  sum(): Promise<any> {
    return this.call('sum');
  }
}
