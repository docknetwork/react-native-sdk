import {
  DataStore,
  DataStoreConfigs,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';

export interface IWallet {
  getDocumentById: (id: string) => Promise<WalletDocument>;
  getDocumentsByType: (type: string) => Promise<WalletDocument[]>;
  addDocument: (json: any) => Promise<WalletDocument>;
  /**
   * Remove document by id
   * @param id
   */
  removeDocument: (id: string) => Promise<void>;
  /**
   * Import data from a Universal Wallet 2020 JSON
   * https://w3c-ccg.github.io/universal-wallet-interop-spec/
   *
   * @param json
   */
  importUniversalWalletJSON: (json: any, password: string) => void;
  /**
   * Create a Universal Wallet 2020 JSON representation of the wallet
   * https://w3c-ccg.github.io/universal-wallet-interop-spec/
   * @returns JSON representation of the wallet
   */
  exportUniversalWalletJSON: (password: string) => any;

  setNetworkId: (networkId: string) => void;
  getNetworkId: () => string;
  dataStore: DataStore;
}

export type CreateWalletProps = DataStoreConfigs & {};
