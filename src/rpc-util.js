import {getLogger} from './logger';

export function createRpcService({name, routes}) {
  return Object.keys(routes).map(routeName => {
    const methodResolver = routes[routeName];
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
            result = methodResolver(...params.__args);
          } else {
            result = methodResolver(params);
          }

          return Promise.resolve(result).then(value => {
            getLogger().log(`Result for ${methodName}`, value);
            return value;
          });
        } catch (err) {
          getLogger().log(`Error for ${methodName}`, err.toString());

          throw err;
        }
      },
    };
  });
}
