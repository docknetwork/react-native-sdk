const webpack = require('webpack');

function build({entry, path, filename}) {
  const compiler = webpack({
    mode: 'production',
    entry,
    output: {
      path,
      filename,
    },
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      },
      // alias: {
      //   process: 'process/browser',
      // },
    },
    experiments: {
      // syncWebAssembly: true,
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']],
              plugins: ['@babel/plugin-transform-flow-strip-types'],
            },
          },
        },
        {
          test: /\.wasm$/,
          // exclude: /(node_modules)/,
          use: {
            loader: 'wasm-loader',
            // options: {
            //   presets: [
            //     [
            //       '@babel/preset-env'
            //     ],
            //   ],
            //   plugins: ['@babel/plugin-transform-flow-strip-types']
            // }
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

    console.log(stats);
  });
}

module.exports = {
  build,
};
