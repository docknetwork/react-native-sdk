import assert from 'assert';
import {v4 as uuid} from 'uuid';
import {DockRpc} from '../client/dock-rpc';
import {KeyringRpc} from '../client/keyring-rpc';
import {UtilCryptoRpc} from '../client/util-crypto-rpc';
import {WalletRpc} from '../client/wallet-rpc';
import {clearCacheData, getRealm, initRealm} from '../core/realm';
import {DocumentType, WalletDocument} from '../types';
import {EventManager} from './event-manager';
import {NetworkManager} from './network-manager';
import {Accounts} from './accounts';
import {getStorage} from '../core/storage';

// import {getEnvironment} from 'realm/lib/utils';
export const WalletEvents = {
  ready: 'ready',
  statusUpdated: 'status-updated',
  documentAdded: 'document-added',
  documentUpdated: 'document-updated',
  documentRemoved: 'document-removed',
  walletDeleted: 'wallet-deleted',
  networkUpdated: 'network-updated',
  networkConnected: 'network-connected',
};

export type WalletStatus = 'closed' | 'loading' | 'ready' | 'error';

// const environment = getEnvironment();

// if (environment !== 'reactnative') {
// require('../setup-nodejs');
// }

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
    this.eventManager.registerEvents(WalletEvents);
    this.accounts = Accounts.getInstance({wallet: this});

    this.setStatus('closed');
  }

  async close() {
    getRealm().close();
    await DockRpc.disconnect();
    this.setStatus('closed');
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

    this.setStatus('loading');

    try {
      await initRealm();
      await UtilCryptoRpc.cryptoWaitReady();
      await WalletRpc.create(this.walletId);
      await WalletRpc.load();

      this.setStatus('ready');
      this.eventManager.emit(WalletEvents.ready);

      this.initNetwork();
    } catch (err) {
      this.setStatus('error');

      throw err;
    }
  }

  deleteWallet() {
    this.eventManager.emit(WalletEvents.walletDeleted); 
    clearCacheData();
    getStorage().removeItem(this.walletId);
  }

  setStatus(status: WalletStatus) {
    assert(!!status, 'status is required');

    this.status = status;
    this.eventManager.emit(WalletEvents.statusUpdated, status);
  }

  async ensureNetwork() {
    if (!this.connectionInProgress) {
      this.initNetwork();
    }

    await this.eventManager.waitFor(WalletEvents.networkConnected);
  }

  async initNetwork() {
    try {
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

      this.eventManager.emit(WalletEvents.networkConnected);
    } finally {
      this.connectionInProgress = false;
    }
  }

  getContext() {
    return this.getContext;
  }

  setContext(context) {
    this.context = context;
  }

  assertReady() {
    assert(
      this.status === 'ready',
      `The wallet is not ready yet, the current status is: ${this.status}`,
    );
  }
  /**
   * Remove document
   * @returns Promise<boolean>
   */
  async remove(documentId) {
    realm.write(() => {
      const cachedAccount = realm
        .objects('Account')
        .filtered('id = $0', documentId)[0];

      if (!cachedAccount) {
        return;
      }

      realm.delete(cachedAccount);
    });

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
    this.assertReady();

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
    this.assertReady();

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
    this.assertReady();

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
    this.assertReady();

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
