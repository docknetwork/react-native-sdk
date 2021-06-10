import {JSONRPCClient} from 'json-rpc-2.0';

let client;

export const getRpcClient = () => client;
export const rpcRequest = (name, ...params) => client.request(name, ...params);

export function initRpcClient(requestHandler) {
  client = new JSONRPCClient(requestHandler);

  client.__request = client.request;
  client.request = (name, ...params) => {
    // console.log('rpc request', {name, params});
    const reqParams =
      params.length === 0
        ? params[0]
        : {
            __args: params,
          };

    return client.__request(name, reqParams);
  };
}
