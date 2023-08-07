module.exports = function (babel) {
  const {types: t} = babel;

  return {
    name: 'transform-bigint-to-number',
    visitor: {
      BigIntLiteral(path) {
        const {node} = path;
        path.replaceWith(t.numericLiteral(Number(node.value)));
      },
    },
  };
};
