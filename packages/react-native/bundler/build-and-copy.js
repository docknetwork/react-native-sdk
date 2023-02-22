const {build} = require('./index');

function buildIndex(callback) {
  console.log('Building index');
  return build({
    entry: require.resolve('./webview-index.js'),
    path: `${__dirname}/../public`,
    filename: 'bundle.js',
    callback,
  });
}

function buildSandbox(callback) {
  console.log('Building sandbox');
  return build({
    entry: require.resolve('./webview-sandbox.js'),
    path: `${__dirname}/../public`,
    filename: 'sandbox.js',
    callback,
  });
}

buildSandbox(() => {
  buildIndex(() => {
    require('./copy-rn-assets');
  });
});
