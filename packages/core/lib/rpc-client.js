import assert from 'assert';
import {JSONRPCClient} from 'json-rpc-2.0';
import {encryptData, SECURE_JSON_RPC} from './core/crypto';
import {Logger} from './core/logger';
import {getLogger} from './logger';
import {patchRpcServer} from './rpc-util';

const waitForClient = async () => new Promise((resolve) => {
  const checkClient = () => {
    if (global.client) {
      return resolve();
    }
    
    setTimeout(checkClient, 200);
  }
  
  checkClient();
});

export const getRpcClient = () => global.client;
export const rpcRequest = async (method, ...params) => {
  assert(typeof method === 'string', `invalid method: ${method}`);

  try {
    Logger.debug('Sending rpc request', {
      method,
      params,
    });

    await waitForClient();
    // assert(!!getRpcClient(), 'json rpc client not found');

    return getRpcClient()
      .request(method, ...params)
      .catch(err => {
        getLogger().log('Error with', {method, params, err});
        throw err;
      });
  } catch (err) {
    getLogger().log('Error with request', {method, params, err});
    throw err;
  }
};

export function initRpcClient(requestHandler) {
  console.log('Rpc client initialized', global.client);

  global.client = new JSONRPCClient(requestHandler);


  global.client.__request = client.request;
  global.client.request = function (name, ...params) {
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

    return global.client.__request(name, reqParams);
  };

  patchRpcServer(client);
}
