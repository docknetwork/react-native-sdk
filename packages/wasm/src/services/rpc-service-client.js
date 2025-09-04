import assert from 'assert';
import {rpcRequest} from '../rpc-client';

export class RpcService {

  constructor(serviceName) {
    assert(!!serviceName, 'serviceName is required');

    this.serviceName = serviceName;
    this.sandbox = false;
  }

  call(method, ...params) {
    assert(typeof method === 'string', 'method is required');

    return rpcRequest(
      `${this.sandbox ? 'sandbox-' : ''}${this.serviceName}.${method}`,
      ...params,
    );
  }
}
