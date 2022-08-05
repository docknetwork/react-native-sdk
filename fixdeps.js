const glob = require('glob');
const fs = require('fs');

glob('node_modules/@polkadot/**/packageInfo.cjs', {}, function (er, files) {
  files.forEach(file => {
    fs.copyFileSync(file, file.replace(`.cjs`, `.js`));
  });
});
