const { override } = require("customize-cra");
const path = require("path");

const supportMjs = () => (config) => {
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });

  /**
   * Add WASM support
   */

// Make file-loader ignore WASM files
//   const wasmExtensionRegExp = /\.wasm$/;
//   config.resolve.extensions.push('.wasm');
//   config.module.rules.forEach(rule => {
//       (rule.oneOf || []).forEach(oneOf => {
//           if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
//               oneOf.exclude.push(wasmExtensionRegExp);
//           }
//       });
//   });

// Add a dedicated loader for WASM
//   config.module.rules.push({
//       test: wasmExtensionRegExp,
//       include: /node_modules/,
//       use: [{ loader: require.resolve('wasm-loader'), options: {} }]
//   });

  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      mrklt: path.resolve(__dirname, "src/mrklt.js"),
    },
  };
  
  // config.output = {
  //   filename: "bundle.min.js",
  // };

  return config;
};

module.exports = override(supportMjs());
