const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

console.log(__dirname);

const sourceDir = path.resolve(__dirname, '../../wallet-sdk/node_modules');
const destDir = path.resolve(__dirname, '../node_modules');

// Direct copy of specific modules
fs.copySync(
  path.join(sourceDir, '@docknetwork/sdk'),
  path.join(destDir, '@docknetwork/sdk'),
  {dereference: true},
);
fs.copySync(
  path.join(sourceDir, '@polkadot'),
  path.join(destDir, '@polkadot'),
  {dereference: true},
);
fs.copySync(path.join(sourceDir, '@noble'), path.join(destDir, '@noble'), {
  dereference: true,
});

// Define an array of blacklist patterns
const blacklistPatterns = [
  'react-native*',
  '@jest',
  '@babel',
  'babel*',
  '@tsconfig',
  'eslint*',
  'jest*',
  'ts*',
  'node-gyp*',
  'realm*',
  '@realm.io*',
  '.bin',
];

// Get all modules in the source directory
const modules = glob.sync(`${sourceDir}/*`);

function copyModules(module, parentDir) {
  const moduleName = path.basename(module);

  // Check if the module matches any blacklist pattern
  const skipModule = blacklistPatterns.some(pattern => {
    return new RegExp(`^${pattern.replace('*', '.*')}$`).test(moduleName);
  });

  if (skipModule) {
    return;
  }

  // Check if the module already exists in the destination directory
  if (!fs.existsSync(path.join(parentDir, moduleName))) {
    // Copy the module to the destination directory
    console.log(`Copied ${module} to ${path.join(parentDir, moduleName)}`);
    fs.copySync(module, path.join(parentDir, moduleName), {dereference: true});
  }

  if (blacklistPatterns.includes(moduleName)) {
    return;
  }

  if (moduleName.indexOf('@') === 0) {
    glob.sync(`${module}/*`).forEach(module => {
      copyModules(module, `${parentDir}/${moduleName}`);
    });
  }
}

modules.forEach(module => copyModules(module, destDir));

// Remove unwanted directories
glob.sync('node_modules/@docknetwork/wallet-sdk-*').forEach(dir => {
  fs.removeSync(dir);
});
