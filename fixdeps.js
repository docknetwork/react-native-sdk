const glob = require('glob');
const fs = require('fs');
console.log(glob);

glob('node_modules/@polkadot/**/packageInfo.cjs', {}, function (er, files) {
  console.log(files);
  files.forEach(file => {
    fs.copyFileSync(file, file.replace(`.cjs`, `.js`));
  });
});
