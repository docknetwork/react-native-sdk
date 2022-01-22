const {build} = require('@docknetwork/wallet-sdk-bundler/webpack');

// build({
//   input: require.resolve('./bundler-test.js'),
//   outputDir: './bundler-test',
// });

build({
  entry: require.resolve('./bundler-test.js'),
  path: `${__dirname}/build`,
  filename: 'build.js',
});
