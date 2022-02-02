import assert from "assert";
import { rpcRequest } from "../rpc-client";

export class RpcService {
  serviceName: string;

  constructor(serviceName) {
    assert(!!serviceName, 'serviceName is required');

    this.serviceName = serviceName;
  }

  call(method, params) {
    assert(typeof method === 'string', 'method is required');

    return rpcRequest(`${this.serviceName}.${method}`, params);
  }
}

