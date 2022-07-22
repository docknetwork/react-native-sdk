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
    ["@babel/plugin-proposal-class-properties", { "loose": false }],
    ["@babel/plugin-proposal-private-methods", { "loose": false }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": false }],
    '@babel/plugin-transform-flow-strip-types',
  ],
};
