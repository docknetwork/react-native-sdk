import {DataSource} from './typeorm';
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
  credentialHostnames: [string | RegExp];
  configs?: any;
};

export type DataStore = {
  db: DataSource;
  networkId: string;
  testNetworkId: string;
  mainNetworkId: string;
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
  // We've tested sqlite, react-native, and sqljs
  dbType?: 'sqlite' | 'react-native' | 'sqljs';

  defaultNetwork?: string;
  testNetworkId?: string;
  mainNetworkId?: string;

  dropSchema?: boolean;

  databasePath: string;

  documentNetworkResolver?: DocumentNetworkResolver;
  sqlJsConfig?: any;
  typeORMConfigs?: any;
};

export type AnyJSON = any;

export type WalletDocument = {
  id: string;
  type: string[] | string;
} & AnyJSON;
