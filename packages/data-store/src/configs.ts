import {DataStoreConfigs} from './types';
import {genericDocumentNetworkResolver} from './document-network-resolver';

export const DEFAULT_CONFIGS: DataStoreConfigs = {
  defaultNetwork: 'mainnet',
  nonIsolatedNetworks: false,
  databasePath: 'dock-wallet-sdk.db',
  documentNetworkResolver: genericDocumentNetworkResolver,
  networks: [
    {
      name: 'Mainnet',
      id: 'mainnet',
      configs: {
        substrateUrl: 'wss://mainnet-node.dock.io',
        addressPrefix: 22,
      },
    },
    {
      name: 'Testnet',
      id: 'testnet',
      configs: {
        substrateUrl: 'wss://knox-1.dock.io',
        addressPrefix: 21,
      },
    },
  ],
};
