module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    ["module-resolver", {
      "root": ["./src"],
      "alias": {
        "node:crypto": "crypto",
        "node:util": "util",
      }
    }],
    "@babel/plugin-transform-modules-commonjs",
    ["@babel/plugin-proposal-class-properties", { "loose": false }],
    ["@babel/plugin-proposal-private-methods", { "loose": false }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": false }],
    '@babel/plugin-transform-flow-strip-types',
  ],
};
