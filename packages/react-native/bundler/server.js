/**
 * For android devices you need to run: adb reverse tcp:8080 tcp:8080
 */
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const {getWebpackConfig} = require('./index.js');

const compiler = Webpack(
  getWebpackConfig({
    entry: require.resolve('./webview-index.js'),
    path: `${__dirname}/../public`,
    filename: 'bundle.js',
  }),
);

const server = new WebpackDevServer(
  {
    open: true,
  },
  compiler,
);

const runServer = async () => {
  console.log('Starting server...');
  await server.start();
};

runServer();
