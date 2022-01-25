const webpack = require('webpack');
const {resolve} = require('path');

function build({entry, path, filename, callback}) {
  const compiler = webpack({
    mode: 'production',
    entry,
    output: {
      path,
      filename,
    },
    resolve: {
      alias: {
        '@polkadot/types/packageInfo.cjs': resolve(
          __dirname,
          '../../node_modules/@polkadot/types/packageInfo.cjs',
        ),
      },
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude:
            /\/node_modules\/(?!@polkadot|@babel|@docknetwork|@digitalbazaar)/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [['@babel/preset-env']],
              plugins: ['@babel/plugin-transform-flow-strip-types'],
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
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
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

    console.log('Build succeed');

    if (callback) {
      callback();
    }
  });
}

module.exports = {
  build,
};
