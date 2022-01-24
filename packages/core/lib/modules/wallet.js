import {v4 as uuid} from 'uuid';
import {DockRpc} from '../client/dock-rpc';
import {KeyringRpc} from '../client/keyring-rpc';
import {UtilCryptoRpc} from '../client/util-crypto-rpc';
import {WalletRpc} from '../client/wallet-rpc';
import {getRealm, initRealm} from '../core/realm';
import {DocumentType, WalletDocument} from '../types';
import {EventManager} from './event-manager';
import {NetworkManager} from './network-manager';
import {Accounts} from './accounts';

export const NetworkConfigs = {
  mainnet: {
    name: 'Dock PoS Mainnet',
    url: 'wss://mainnet-node.dock.io',
    addressPrefix: 22,
  },
  testnet: {
    name: 'Dock PoS Testnet',
    url: 'wss://knox-1.dock.io',
    addressPrefix: 21,
  },
  local: {
    name: 'Local Node',
    url: 'ws://127.0.0.1:9944',
    addressPrefix: 21,
  },
};

export const WalletEvents = {
  ready: 'ready',
  documentAdded: 'document-added',
  documentUpdated: 'document-updated',
  documentRemoved: 'document-removed',
  networkUpdated: 'network-updated',
  networkConnected: 'network-connected',
};

export type WalletStatus = 'closed' | 'loading' | 'ready';

/** Wallet */
export class Wallet {
  networkManager: NetworkManager;
  context: string[];
  status: WalletStatus;
  apiConnected: boolean;
  eventManager: EventManager;
  walletId: string;
  accounts: Accounts;

  constructor({
    walletId = 'dock-wallet',
    context = ['https://w3id.org/wallet/v1'],
  } = {}) {
    this.walletId = walletId;
    this.context = context;
    this.networkManager = NetworkManager.getInstance();
    this.eventManager = new EventManager();
    this.status = 'closed';
    this.eventManager.registerEvents(WalletEvents);
    this.accounts = Accounts.getInstance({wallet: this});
  }

  async close() {
    getRealm().close();
    await DockRpc.disconnect();
    this.status = 'closed';
  }
  /**
   * Load wallet
   */
  async load() {
    if (this.status === 'loading') {
      return this.eventManager.waitFor(WalletEvents.ready);
    }

    if (this.status === 'ready') {
      return;
    }

    this.status = 'loading';

    await initRealm();
    await UtilCryptoRpc.cryptoWaitReady();
    await WalletRpc.create(this.walletId);
    await WalletRpc.load();
    this.status = 'ready';
    this.initNetwork();
  }

  async ensureNetwork() {
    if (!connectionInProgress) {
      this.initNetwork();
    }

    await this.eventManager.waitFor(WalletEvents.networkConnected);
  }

  async initNetwork() {
    this.connectionInProgress = true;

    const networkInfo = this.networkManager.getNetworkInfo();
    await KeyringRpc.initialize({
      ss58Format: networkInfo.addressPrefix,
    });

    const isDockConnected = await DockRpc.isApiConnected();

    if (isDockConnected) {
      await DockRpc.disconnect();
    }

    await DockRpc.init({
      address: networkInfo.substrateUrl,
    });

    this.connectionInProgress = false;
  }

  getContext() {
    return this.getContext;
  }

  setContext(context) {
    this.context = context;
  }

  /**
   * Remove document
   * @returns Promise<boolean>
   */
  async remove(documentId) {
    await WalletRpc.remove(documentId);
    this.eventManager.emit(WalletEvents.documentRemoved, documentId);
  }

  /**
   * Add document to the wallet
   * @param {*} options
   * @throws InvalidAccountErrors
   * @returns document
   */
  async add(document: WalletDocument) {
    const newDocument = {
      ...document,
      id: document.id || uuid(),
      '@context': document.context || this.context,
    };

    await WalletRpc.add(newDocument);

    this.eventManager.emit(WalletEvents.documentAdded, newDocument);

    return newDocument;
  }

  async update(document: WalletDocument) {
    await WalletRpc.update(document);
    this.eventManager.emit(WalletEvents.documentUpdated, document);
    return document;
  }

  async export(password) {
    return WalletRpc.exportWallet(password);
  }
  /**
   * Add all documents in the wallet
   * @param {*} options
   * @returns document
   */
  query(
    params: {
      type: DocumentType,
      id: string,
      name: string,
    } = {},
  ): Promise<WalletDocument[]> {
    let equals;

    Object.keys(params).forEach(key => {
      const value = params[key];

      if (!value) {
        return;
      }

      if (!equals) {
        equals = {};
      }

      equals[`content.${key}`] = value;
    });

    return WalletRpc.query({
      equals,
    });
  }

  async getDocumentById(documentId) {
    const result = await this.query({id: documentId});
    return result[0];
  }

  static async create({walletId, json, password} = {}): Wallet {
    const wallet = new Wallet({walletId});

    await wallet.load();

    if (json) {
      await WalletRpc.importWallet(json, password);
    }

    return wallet;
  }

  /**
   * Get wallet module instance
   * @returns Wallet
   */
  static getInstance(): Wallet {
    if (!Wallet.instance) {
      Wallet.instance = new Wallet();
    }

    return Wallet.instance;
  }
}
