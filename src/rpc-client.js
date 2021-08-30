import {JSONRPCClient} from 'json-rpc-2.0';
import { getLogger } from './logger';

let client;

export const getRpcClient = () => client;
export const rpcRequest = (method, ...params) => {
  try {
    getLogger().log('Sending rpc request', {
      method,
      params
    });

    if (!client) {
      return {};
    }

    return client.request(method, ...params)
      .catch(err => {
        getLogger().log('Error with', { method, params, err });
        throw err;
      })
      
  } catch(err) {
    getLogger().log('Error with request', { method, params, err });
    throw err;
  }
};

export function initRpcClient(requestHandler) {
  client = new JSONRPCClient(requestHandler);

  client.__request = client.request;
  client.request = function (name, ...params) {
    return client.__request(name, params.length === 0 ? params[0] : {
      __args: params,
    });
  };
}
