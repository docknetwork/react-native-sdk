import {DataSource} from 'typeorm';
import {WalletEntity} from './entities/wallet.entity';

export type DocumentResolverProps = {
  document: WalletDocument;
  dataStore: DataStore;
};
export type DocumentNetworkResolver = (
  input: DocumentResolverProps,
) => Promise<DocumentResolverResult>;

export type DocumentResolverResult = {
  networkId: string;
  isFallback: boolean;
};

export type Network = {
  name: string;
  id: string;
  credentialHostnames: string[];
  configs?: any;
};

export type DataStore = {
  db: DataSource;
  networkId: string;
  testNetworkId: string;
  network: Network;

  networks: Network[];
  version?: string;
  resolveDocumentNetwork: DocumentNetworkResolver;
  setNetwork: (networkId: string) => Promise<void>;
};

export type ContextProps = {
  dataStore: DataStore;
};

export type DataStoreConfigs = {
  driver?: any;
  networks?: Network[];

  // Typeorm supported multiple RDBMS types https://typeorm.io/data-source-options#common-data-source-options
  // We only tested sqlite and react-native sqlite so far
  dbType?: 'sqlite' | 'react-native';

  defaultNetwork?: string;
  testNetworkId?: string;

  dropSchema?: boolean;

  databasePath: string;

  documentNetworkResolver?: DocumentNetworkResolver;
};

export type AnyJSON = any;

export type WalletDocument = {
  id: string;
  type: string[] | string;
} & AnyJSON;
