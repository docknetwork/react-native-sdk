const syncDirectory = require('sync-directory');
const path = require('path');

const sdkRoot = path.resolve(__dirname, '../../wallet-sdk');
const appModules = path.resolve(__dirname, '../node_modules/@docknetwork/');

const watch = process.argv[2] === '--watch';

function syncPackage(packageName) {
  try {
    return syncDirectory.sync(
      path.resolve(sdkRoot, `./packages/${packageName}`),
      path.resolve(appModules, `./wallet-sdk-${packageName}`),
      {
        afterEachSync(props) {
          console.log(props);
        },
        watch,
        exclude: [/node_modules/],
      },
    );
  } catch (err) {
    console.error(err);
  }
}

syncPackage('core');
syncPackage('data-store');
syncPackage('wasm');
syncPackage('react-native');
syncPackage('credentials');
syncPackage('transactions');
syncPackage('dids');
syncPackage('request-logger');
syncPackage('relay-service');
