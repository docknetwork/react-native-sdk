import {
  DataStore,
  DataStoreConfigs,
  DocumentResolverResult,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {Accounts} from '@docknetwork/wallet-sdk-wasm/lib/modules/accounts';
import {EventEmitter} from 'events';

export interface IV1Wallet {
  accounts: Accounts;

  getStatus: () => string;
  setStatus: (status: string) => void;
  eventManager: EventEmitter;
  waitForEvent: (eventName: string) => Promise<any>;
  resolveCorrelations: (id: string) => Promise<WalletDocument[]>;
  query: ({
    id,
    type,
  }?: {
    id?: string;
    type?: string;
  }) => Promise<WalletDocument[]>;

  ensureNetwork: () => Promise<void>;
  sync: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  create: (json: any) => Promise<WalletDocument>;
  update: (json: any) => Promise<WalletDocument>;
  upsert: (json: any) => Promise<WalletDocument>;
  deleteWallet: () => Promise<void>;
}

export type IWallet = {
  getDocumentById: (id: string) => Promise<WalletDocument>;
  getDocumentsByType: (type: string) => Promise<WalletDocument[]>;
  getAllDocuments: () => Promise<WalletDocument[]>;
  addDocument: (json: any) => Promise<WalletDocument>;
  upsertDocument: (json: any) => Promise<WalletDocument>;
  updateDocument: (json: any) => Promise<WalletDocument>;
  getDocumentCorrelations: (documentId: string) => Promise<WalletDocument[]>;
  getAccountKeyPair: (accountId: string) => Promise<any>;
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
  importUniversalWalletJSON: (json: any, password: string) => Promise<void>;
  /**
   * Create a Universal Wallet 2020 JSON representation of the wallet
   * https://w3c-ccg.github.io/universal-wallet-interop-spec/
   * @returns JSON representation of the wallet
   */
  exportUniversalWalletJSON: (password: string) => any;

  setNetwork: (networkId: string) => Promise<void>;
  getNetworkId: () => string;
  resolveDocumentNetwork: (document: any) => Promise<DocumentResolverResult>;
  dataStore: DataStore;
} & IV1Wallet;

export type CreateWalletProps = DataStoreConfigs & {};
