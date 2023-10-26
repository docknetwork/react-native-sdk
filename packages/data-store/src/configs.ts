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
        substrateUrl: 'https://mainnet-node.dock.io/h',
        addressPrefix: 22,
      },
    },
    {
      name: 'Testnet',
      id: 'testnet',
      credentialHostnames: ['creds-testnet.dock.io', '***REMOVED***'],
      configs: {
        substrateUrl: 'https://knox-1.dock.io/h',
        addressPrefix: 21,
      },
    },
  ],
};
