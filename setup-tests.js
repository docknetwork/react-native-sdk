import '@testing-library/jest-dom';
import {JSDOM} from 'jsdom';

import {NetworkManager} from './packages/wasm/src/modules/network-manager';
import {getStorage} from './packages/wasm/src/core/storage';
import './packages/transactions/lib/schema';
import Realm from 'realm';
import {
  initRealm,
  setRealmInstance,
} from '@docknetwork/wallet-sdk-wasm/src/core/realm';
import {mockDockService} from '@docknetwork/wallet-sdk-wasm/src/services/test-utils';

setRealmInstance(Realm);
initRealm();
NetworkManager.getInstance().setNetworkId('testnet');

mockDockService();

process.env.ENCRYPTION_KEY =
  '776fe87eec8c9ba8417beda00b23cf22f5e134d9644d0a195cd9e0b7373760c1';

const cfg = {url: 'http://localhost'};
const dom = new JSDOM('', cfg);
global.window = dom.window;
global.document = dom.window.document;
//
// Object.keys(global.window).forEach(property => {
//   if (typeof global[property] === 'undefined') {
//     global[property] = global.window[property];
//   }
// });

global.navigator = {
  userAgent: 'node.js',
  appVersion: [],
};

require('@docknetwork/wallet-sdk-wasm/src/setup-tests');

jest.mock('@react-native-async-storage/async-storage', () => 'AsyncStorage');

jest.mock('@docknetwork/sdk/presentation', () => {
  const mockAddCredentialToPresent = jest.fn(() => 0);
  const mockAddAttributeToReveal = jest.fn();
  const mockCreatePresentation = jest.fn();
  const mockDeriveCredentials = jest.fn(() => []);
  return jest.fn().mockImplementation(() => {
    return {
      addCredentialToPresent: mockAddCredentialToPresent,
      addAttributeToReveal: mockAddAttributeToReveal,
      createPresentation: mockCreatePresentation,
      deriveCredentials: mockDeriveCredentials,
    };
  });
});

global.localStorage.setItem('networkId', 'testnet');
