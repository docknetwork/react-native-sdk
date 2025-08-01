const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: ['web', 'es2022'],
  devtool: false,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.wasm'],
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
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        use: ['wasm-loader'],
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
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
