export type Network = {
  name: string;
  id: string;
};

export type Wallet = {
  name: string;
  id: string;
  network: string;
  default?: boolean;
};

export type SDKConfigs = {
  activeWallet: string;
  version?: string;
};

export type DataStoreConfigs = {
  wallets?: Wallet[];
  networks?: Network[];
  sdkConfigs?: SDKConfigs;

  dropSchema?: boolean;

  databasePath: string;
};

export type MigrationInput = {
  sdkConfigs: SDKConfigs;
};

export type MigrationResult = {
  migrated: boolean;
  sdkConfigs: SDKConfigs;
};
