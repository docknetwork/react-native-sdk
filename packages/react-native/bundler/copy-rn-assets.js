const assert = require('assert');
const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const bundleDir = path.resolve(__dirname, '../public/');
const bundlePath = path.resolve(bundleDir, './bundle.js');
const sandboxPath = path.resolve(bundleDir, './sandbox.js');
const htmlPath = path.resolve(bundleDir, './index.html');
const sandboxHtmlPath = path.resolve(bundleDir, './sandbox.html');

assert(fs.readFileSync(bundlePath), `bundle file not found at: ${bundlePath}`);

const appDir = process.cwd();
const destPath = path.resolve(appDir, './assets/app-html');

if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath);
}

fs.copyFileSync(bundlePath, path.resolve(destPath, './bundle.js'));
fs.copyFileSync(sandboxPath, path.resolve(destPath, './sandbox.js'));
fs.copyFileSync(htmlPath, path.resolve(destPath, './index.html'));
fs.copyFileSync(sandboxHtmlPath, path.resolve(destPath, './sandbox.html'));

console.log('Copying files to', destPath);

execSync(`rm -rf ${appDir}/android/app/src/main/assets/app-html`);
execSync(`cp -rf ${destPath} ${appDir}/android/app/src/main/assets/app-html`);
