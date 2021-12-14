import {JSONRPCClient} from 'json-rpc-2.0';
import {decryptData, encryptData, SECURE_JSON_RPC} from './core/crypto';
import {getLogger} from './logger';
import {patchRpcServer} from './rpc-util';

let client;

export const getRpcClient = () => client;
export const rpcRequest = (method, ...params) => {
  try {
    getLogger().log('Sending rpc request', {
      method,
      params,
    });

    if (!client) {
      return {};
    }

    return getRpcClient().request(method, ...params).catch(err => {
      getLogger().log('Error with', {method, params, err});
      throw err;
    });
  } catch (err) {
    getLogger().log('Error with request', {method, params, err});
    throw err;
  }
};

export function initRpcClient(requestHandler) {
  client = new JSONRPCClient(requestHandler);

  client.__request = client.request;
  client.request = function (name, ...params) {
    let reqParams =
      params.length === 0
        ? params[0]
        : {
            __args: params,
          };

    if (SECURE_JSON_RPC && reqParams) {
      reqParams = encryptData(
        JSON.stringify({
          reqParams,
        }),
      );
    }

    return client.__request(name, reqParams);
  };

  patchRpcServer(client);
}
