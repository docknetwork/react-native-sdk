const {build} = require('@docknetwork/wallet-sdk-bundler');

build({
  input: require.resolve('./test.js'),
  outputDir: './test',
});
