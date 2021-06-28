import { rpcRequest } from "../rpc-client";

export class StorageRpc {
  static getItem(...params) {
    return rpcRequest("storage.getItem", ...params);
  }
  static setItem(...params) {
    return rpcRequest("storage.setItem", ...params);
  }
  static removeItem(...params) {
    return rpcRequest("storage.removeItem", ...params);
  }
}
