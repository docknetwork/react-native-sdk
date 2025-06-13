import assert from 'assert';
import {decryptData, SECURE_JSON_RPC} from './core/crypto';
import {Logger} from './core/logger';

export function createMethodResolver({service, methodFn, methodName}) {
  if (methodFn === undefined) {
    throw new Error(
      `Resolver is undefined for ${methodName} in ${service.name}`,
    );
  }

  const methodPath = `${service.name}.${methodName}`;

  return {
    name: methodPath,
    resolver: async (params = {}) => {
      try {
        let result;

        if (!methodFn) {
          throw new Error('Resolver is undefined');
        }

        if (params.__args) {
          result = methodFn.apply(service, params.__args);
        } else {
          result = methodFn.apply(service, [params]);
        }

        return Promise.resolve(result).then(value => {
          Logger.debug(`Result for ${methodPath}`, value);
          return value;
        });
      } catch (err) {
        Logger.debug(`Error for ${methodPath}`, err.toString());
        throw err;
      }
    },
  };
}

export function createRpcService(service) {
  const {name, rpcMethods} = service;

  assert(
    typeof name === 'string',
    `invalid name: ${name} for service ${service.constructor.name}`,
  );
  assert(
    typeof rpcMethods === 'object',
    `invalid routes: ${rpcMethods} for service ${service.constructor.name}`,
  );

  let methods = rpcMethods;

  if (!Array.isArray(rpcMethods)) {
    return Object.keys(rpcMethods).map(key => {
      return createMethodResolver({
        methodFn: rpcMethods[key],
        methodName: key,
        service,
      });
    });
  }

  return methods.map(methodFn => {
    if (methodFn === undefined) {
      throw new Error(
        `Method is undefined in ${
          service.name
        }, available methods: ${Object.keys(service.rpcMethods).join(', ')}`,
      );
    }

    return createMethodResolver({
      methodFn,
      methodName: methodFn.name,
      service,
    });
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
