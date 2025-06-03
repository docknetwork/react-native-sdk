const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: ['web', 'es2022'],
  resolve: {
    extensions: ['.js', '.jsx', '.wasm'],
    alias: {
      realm: path.resolve(__dirname, 'shims/realm.js'),
      'react-native-sqlite-storage': path.resolve(
        __dirname,
        'shims/react-native-sqlite-storage.js',
      ),
    },
  },
  module: {
    rules: [
      // JS/JSX loader with fullySpecified false for ESM interop
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
      global: 'global',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      global: 'globalThis',
    }),
    new NodePolyfillPlugin({
      excludeAliases: ['console'],
    }),
  ],
};
