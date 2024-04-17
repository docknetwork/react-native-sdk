import {DataStoreConfigs} from './types';
import {genericDocumentNetworkResolver} from './document-network-resolver';

export const DEFAULT_CONFIGS: DataStoreConfigs = {
  dbType: 'sqlite',
  databasePath: 'dock-wallet-sdk.db',
  documentNetworkResolver: genericDocumentNetworkResolver,
  networks: [
    {
      name: 'Mainnet',
      id: 'mainnet',
      credentialHostnames: ['creds.dock.io'],
      configs: {
        substrateUrl: 'wss://mainnet-node.dock.io',
        addressPrefix: 22,
      },
    },
    {
      name: 'Testnet',
      id: 'testnet',
      credentialHostnames: [/creds-.*\.dock\.io/],
      configs: {
        substrateUrl: 'wss://knox-1.dock.io',
        addressPrefix: 21,
      },
    },
  ],
};
