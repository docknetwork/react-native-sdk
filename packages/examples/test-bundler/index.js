const {build} = require('@docknetwork/wallet-sdk-react-native/webpack');

build({
  entry: require.resolve('./bundler-test.js'),
  path: `${__dirname}/build`,
  filename: 'build.js',
});
