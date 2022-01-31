import assert from "assert";
import { rpcRequest } from "../rpc-client";

export class RpcService {
  serviceName: string;

  constructor(serviceName) {
    assert(!!serviceName, 'serviceName is required');

    this.serviceName;
  }

  call(method, params) {
    assert(typeof method === 'string', 'method is required');

    rpcRequest(`${this.serviceName}.${method}`, params);
  }
}

