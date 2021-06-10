export function createRpcService({ name, routes }) {
  return routes.map((methodResolver) => {
    return {
      name: `${name}.${methodResolver.name}`,
      resolver: (params = {}) => {
        if (params.__args) {
          return methodResolver(...params.__args);
        }

        return methodResolver(params);
      },
    };
  });
}