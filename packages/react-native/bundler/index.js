const webpack = require('webpack');
const {resolve} = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const getWebpackConfig = ({entry, path, filename}) => ({
  mode: 'development',
  entry,
  output: {
    path,
    filename,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json', '.mjs', '.cjs'],
    alias: {
      '@polkadot/types/packageInfo.cjs': resolve(
        __dirname,
        '../../../node_modules/@polkadot/types/packageInfo.cjs',
      ),
      '@polkadot/types/packageInfo.js': resolve(
        __dirname,
        '../../../node_modules/@polkadot/types/packageInfo.js',
      ),
      '@polkadot/rpc-core/packageInfo.cjs': resolve(
        __dirname,
        '../../../node_modules/@polkadot/rpc-core/packageInfo.cjs',
      ),
      '@polkadot/rpc-core/packageInfo.js': resolve(
        __dirname,
        '../../../node_modules/@polkadot/rpc-core/packageInfo.js',
      ),
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      os: require.resolve('os-browserify'),
      process: require.resolve('process'),
      https: false,
      http: false,
      fs: false,
      zlib: false,
      path: false,
    },
  },
  module: {
    rules: [
      // {
      //   test: /\.ts?$/,
      //   use: {
      //     loader: require.resolve('ts-loader'),
      //     options: {
      //       onlyCompileBundledFiles: true,
      //       compilerOptions: {
      //         module: 'esnext',
      //         target: 'esnext',
      //       },
      //     },
      //   },
      //   exclude: [/\/node_modules\/(?!@polkadot|@digitalbazaar)/],
      // },
      // {
      //   test: /[\\/]node_modules[\\/]webassembly-interpreter[\\/]/,
      //   resolve: {
      //     fullySpecified: false,
      //   },
      // },
      {
        test: /\.(m|c)?(j|t)s$/,
        exclude: [/\/node_modules\/(?!@polkadot|@docknetwork|@digitalbazaar)/],
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            rootMode: 'upward',
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: [
              '@babel/plugin-transform-async-to-generator',
              '@babel/plugin-syntax-bigint',
              '@babel/plugin-transform-modules-commonjs',
              ['@babel/plugin-proposal-class-properties', {loose: false}],
              ['@babel/plugin-proposal-private-methods', {loose: false}],
              [
                '@babel/plugin-proposal-private-property-in-object',
                {loose: false},
              ],
              '@babel/plugin-transform-flow-strip-types',
            ],
          },
        },
      },
      // {
      //   test: /\.wasm$/,
      //   use: {
      //     loader: require.resolve('wasm-loader'),
      //   },
      // },
    ],
  },
  experiments: {
    syncWebAssembly: true,
    asyncWebAssembly: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new NodePolyfillPlugin({
      excludeAliases: ['console'],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: require.resolve('process/browser'),
    }),
  ],
});

function build({entry, path, filename, callback}) {
  const compiler = webpack(
    getWebpackConfig({
      entry,
      path,
      filename,
    }),
  );

  compiler.run(function (err, stats) {
    if (err) {
      console.error(err);
    }

    if (stats.compilation.errors.length) {
      console.log(stats.compilation.errors);
      process.exit(1);
    }

    console.log('Build succeeded');

    if (callback) {
      callback();
    }
  });
}

module.exports = {
  getWebpackConfig,
  build,
};
