export function generateMethods({ parent, methodList }) {
  return methodList.map((methodResolver) => {
    return {
      name: `${parent}.${methodResolver.name}`,
      resolver: (params = {}) => {
        if (params.__args) {
          return methodResolver(...params.__args);
        }

        return methodResolver(params);
      },
    };
  });
}