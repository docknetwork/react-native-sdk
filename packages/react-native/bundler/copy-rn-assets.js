const assert = require('assert');
const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const bundleDir = path.resolve(__dirname, '../public/');
const appDir = process.cwd();
const destPath = path.resolve(appDir, './assets/app-html');

// Check if at least one file exists in the directory
glob(bundleDir + '/*.@(js|html|wasm)', (err, files) => {
  if (err) {
    console.error('An error occurred:', err);
    return;
  }

  assert(files.length > 0, `No bundle files found in directory: ${bundleDir}`);

  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  }

  // Copy each file from the source to the destination
  files.forEach(filePath => {
    const fileName = path.basename(filePath);
    fs.copyFileSync(filePath, path.resolve(destPath, `./${fileName}`));
  });

  console.log('Copying files to', destPath);

  // Execute the shell commands to update Android assets
  execSync(`rm -rf ${appDir}/android/app/src/main/assets/app-html`);
  execSync(`cp -rf ${destPath} ${appDir}/android/app/src/main/assets/app-html`);
});
