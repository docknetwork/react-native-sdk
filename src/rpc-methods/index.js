import utilCryptoMethods from './util-crypto';
import testMethods from './test';
import keyring from './keyring';
import dockRpc from './dock-rpc';
import apiRpc from './api-rpc';


export default [
  ...utilCryptoMethods,
  ...testMethods,
  ...keyring,
  ...dockRpc,
  ...apiRpc,
];
