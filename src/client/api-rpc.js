import { rpcRequest } from "../rpc-client";

export class ApiRpc {
  static getAccountBalance(...params) {
    return rpcRequest("api.getAccountBalance", ...params);
  }

  static sendTokens(...params) {
    return rpcRequest("api.sendTokens", ...params);
  }

  static getFeeAmount(...params) {
    return rpcRequest("api.getFeeAmount", ...params);
  }
}
