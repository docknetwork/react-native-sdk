import { rpcRequest } from "../rpc-client";

type RpcClientOptions = {
  cachedResources: string[]
};


class RpcClient {
  cachedResources: string[];

  constructor(options: RpcClientOptions = {}) {
    this.cachedResources = options.cachedResources;
  }

  request(resource, ...params) {
    return rpcRequest(resource, ...params);
    // const isCached = this.cachedResources && this.cachedResources[resource];
    // const cacheKey = isCached && JSON.stringify(params);


    // return response.then(data => {
    //   // if (isCached) {
    //   //   this.cachedResources[resource][]
    //   // }
      
    //   return data;
    // });
  }
}


export class WalletRpc extends RpcClient {   
  constructor(options) {
    super(options);
  }

  static create(...params) {
    return rpcRequest("wallet.create", ...params);
  }
  static load(...params) {
    return rpcRequest("wallet.load", ...params);
  }
  static sync(...params) {
    return rpcRequest("wallet.sync", ...params);
  }
  static lock(...params) {
    return rpcRequest("wallet.lock", ...params);
  }
  static unlock(...params) {
    return rpcRequest("wallet.unlock", ...params);
  }
  static status(...params) {
    return rpcRequest("wallet.status", ...params);
  }
  static toJSON(...params) {
    return rpcRequest("wallet.toJSON", ...params);
  }
  static add(...params) {
    return rpcRequest("wallet.add", ...params);
  }
  static remove(...params) {
    return rpcRequest("wallet.remove", ...params);
  }
  static update(...params) {
    return rpcRequest("wallet.update", ...params);
  }
  static query(...params) {
    return rpcRequest("wallet.query", ...params);
  }
  static getStorageDocument(...params) {
    return rpcRequest("wallet.getStorageDocument", ...params);
  }
  static export(...params) {
    return rpcRequest("wallet.exportWallet", ...params);
  }
  static exportAccount(accountId, password) {
    return rpcRequest("wallet.exportAccount", accountId, password);
  }
  static importWallet(data, password) {
    return rpcRequest("wallet.importWallet", data, password);
  }
}
