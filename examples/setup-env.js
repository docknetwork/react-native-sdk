global.window = {};
process.env.ENCRYPTION_KEY =
  '776fe87eec8c9ba8417beda00b23cf22f5e134d9644d0a195cd9e0b7373760c1';

import 'mock-local-storage';
window.localStorage = global.localStorage;

import '@docknetwork/wallet-sdk-wasm/lib/setup-tests';
