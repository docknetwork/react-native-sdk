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
  configs?: any;
};

export type DataStore = {
  db: DataSource;
  networkId: string;
  version?: string;
  resolveDocumentNetwork: DocumentNetworkResolver;
};

export type ContextProps = {
  dataStore: DataStore;
};

export type DataStoreConfigs = {
  networks?: Network[];

  defaultNetwork?: string;
  nonIsolatedNetworks?: boolean;

  dropSchema?: boolean;

  databasePath: string;

  documentNetworkResolver?: DocumentNetworkResolver;
};

export type AnyJSON = any;

export type WalletDocument = {
  id: string;
  type: string[] | string;
} & AnyJSON;
