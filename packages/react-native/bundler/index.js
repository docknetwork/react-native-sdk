const webpack = require('webpack');
const {resolve} = require('path');

function build({entry, path, filename, callback}) {
  const compiler = webpack({
    mode: 'development',
    entry,
    output: {
      path,
      filename,
    },
    resolve: {
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
        {
          test: /\.(m|c)?js$/,
          exclude:
            /\/node_modules\/(?!@polkadot|@babel|@docknetwork|@digitalbazaar)/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [['@babel/preset-env']],
              plugins: [
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
        {
          test: /\.wasm$/,
          use: {
            loader: require.resolve('wasm-loader'),
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
        // 'process.argv': '""',
        // 'process.stdout': '""',
        // "process.stderr": '""',
        // "process.platform": ""
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: require.resolve('process/browser'),
      }),
    ],
  });

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
  build,
};
