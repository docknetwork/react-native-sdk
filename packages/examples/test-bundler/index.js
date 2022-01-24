const {build} = require('@docknetwork/wallet-sdk-bundler/webpack');

build({
  entry: require.resolve('./bundler-test.js'),
  path: `${__dirname}/build`,
  filename: 'build.js',
});
