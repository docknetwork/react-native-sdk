import assert from 'assert';
import {decryptData, SECURE_JSON_RPC} from './core/crypto';
import {Logger} from './core/logger';

export function createRpcService(service) {
  const { name, rpcMethods } = service;

  assert(typeof name === 'string', `invalid name: ${name} for service ${service.constructor.name}`);
  assert(typeof rpcMethods === 'object', `invalid routes: ${rpcMethods} for service ${service.constructor.name}`);

  return rpcMethods.map(methodResolver => {
    const routeName = methodResolver.name;
    const methodName = `${name}.${routeName}`;

    return {
      name: methodName,
      resolver: async (params = {}) => {
        try {
          let result;

          if (!methodResolver) {
            throw new Error('Resolver is undefined');
          }

          if (params.__args) {
            result = methodResolver.apply(service, params.__args);
          } else {
            result = methodResolver.apply(service, [params]);
          }

          return Promise.resolve(result).then(value => {
            Logger.debug(`Result for ${methodName}`, value);
            return value;
          });
        } catch (err) {
          Logger.debug(`Error for ${methodName}`, err.toString());
          throw err;
        }
      },
    };
  });
}

export function patchRpcServer(server) {
  server.__receive = server.receive;

  server.receive = function (reqData) {
    try {
      if (SECURE_JSON_RPC && reqData.params && reqData.params.encryptedData) {
        const params = decryptData(reqData.params);
        reqData.params = JSON.parse(params).reqParams;
      }
    } catch (err) {
      console.error(err);
    }

    return server.__receive(reqData);
  };

  return server;
}
