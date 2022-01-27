const {build} = require('./index');

build({
  entry: require.resolve('./webview-index.js'),
  path: `${__dirname}/../public`,
  filename: 'bundle.js',
});
