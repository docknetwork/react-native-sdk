import assert from 'assert';
import {v4 as uuid} from 'uuid';
import {clearCacheData, getRealm, initRealm} from '../core/realm';
import {getStorage} from '../core/storage';
import {dockService} from '../services/dock';
import {keyringService} from '../services/keyring';
import {utilCryptoService} from '../services/util-crypto';
import {walletService} from '../services/wallet';
import {DocumentType, WalletDocument} from '../types';
import {Accounts} from './accounts';
import {EventManager} from './event-manager';
import {NetworkManager} from './network-manager';
import {migrate} from './data-migration';
import {Logger} from '../core/logger';

/** Wallet events */
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

/** Wallet status */
export type WalletStatus = 'closed' | 'loading' | 'ready' | 'error';

// const environment = getEnvironment();

// if (environment !== 'reactnative') {
// require('../setup-nodejs');
// }

if (!global.walletInstances) {
  global.walletInstances = 0;
}

/**
 * Wallet
 */
class Wallet {
  networkManager: NetworkManager;
  context: string[];
  status: WalletStatus;
  apiConnected: boolean;
  eventManager: EventManager;
  walletId: string;
  accounts: Accounts;

  /**
   * @constructor
   * @param {object} params
   */
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

    global.walletInstances++;

    setTimeout(() => {
      if (global.walletInstances > 0) {
        console.warn(
          "Multiple wallet instances were created. If that's not intentional please check your code, and use the Wallet.getInstance() instead of creating a new instance",
        );
      }
    }, 2000);

    this.setStatus('closed');
  }

  /**
   * Get the y value.
   * @return {Promise} The y value.
   */
  async load() {
    if (this.status === 'loading') {
      return this.eventManager.waitFor(WalletEvents.ready);
    }

    if (this.status === 'ready') {
      return;
    }

    this.setStatus('loading');

    const networkId = (await getStorage().getItem('networkId')) || 'mainnet';
    this.networkManager.setNetworkId(networkId);

    try {
      await initRealm();
      await utilCryptoService.cryptoWaitReady();
      await keyringService.initialize({
        ss58Format: this.networkManager.getNetworkInfo().addressPrefix,
      });

      await walletService.create({
        walletId: this.walletId,
      });

      await walletService.sync();
      await walletService.load();

      this.setStatus('ready');

      this.eventManager.emit(WalletEvents.ready);

      this.initNetwork();

      this.migrated = await migrate({wallet: this});
    } catch (err) {
      this.setStatus('error');

      throw err;
    }
  }

  async getVersion() {
    const docs = await this.query({});
    const versionDoc = docs.find(
      (item: WalletDocument) =>
        item.type === 'Metadata' && !!item.walletVersion,
    );
    return (versionDoc && versionDoc.walletVersion) || '0.1';
  }
  /**
   *
   * Close wallet
   */
  async close() {
    getRealm().close();
    await dockService.disconnect();
    this.setStatus('closed');
  }

  async switchNetwork(networkId) {
    getStorage().setItem('networkId', networkId);

    this.networkManager.setNetworkId(networkId);

    await this.initNetwork();
  }
  /**
   * delete wallet
   */
  async deleteWallet() {
    this.eventManager.emit(WalletEvents.walletDeleted);
    clearCacheData();
    await getStorage().removeItem(this.walletId);
    await walletService.create({
      walletId: this.walletId,
    });
    await walletService.load();
    await walletService.sync();
  }

  /**
   *
   * @param {*} status
   */
  setStatus(status: WalletStatus) {
    assert(!!status, 'status is required');

    this.status = status;
    this.eventManager.emit(WalletEvents.statusUpdated, status);
  }

  /**
   * Ensure network
   *
   * @returns Promise
   */
  async ensureNetwork() {
    if (!this.connectionInProgress) {
      this.initNetwork();
    } else if (this.networkReady) {
      return;
    }

    await this.eventManager.waitFor(WalletEvents.networkConnected);
  }

  async initNetwork() {
    try {
      this.connectionInProgress = true;

      const networkInfo = this.networkManager.getNetworkInfo();
      await keyringService.initialize({
        ss58Format: networkInfo.addressPrefix,
      });

      Logger.debug(`Initializing network ${JSON.stringify(networkInfo)}`);
      const isDockConnected = await dockService.isApiConnected();

      if (isDockConnected) {
        await dockService.disconnect();
      }

      await dockService.init({
        address: networkInfo.substrateUrl,
      });

      this.eventManager.emit(WalletEvents.networkConnected);
    } finally {
      this.connectionInProgress = false;
      this.networkReady = true;
    }
  }

  async waitReady() {
    if (this.status === 'ready') {
      return;
    }

    let warningTimeout = setTimeout(() => {
      throw new Error(
        'Wallet module timed out. Make sure the wallet is loaded, or you are not using multiple instances',
      );
    }, 6000);

    await this.eventManager.waitFor(WalletEvents.ready);

    clearTimeout(warningTimeout);
  }

  getContext() {
    return this.getContext;
  }

  setContext(context) {
    this.context = context;
  }

  assertReady() {
    return this.waitReady();
  }
  /**
   * Remove document
   * @returns Promise<boolean>
   */
  async remove(documentId) {
    await walletService.remove(documentId);
    this.eventManager.emit(WalletEvents.documentRemoved, documentId);
  }

  /**
   * Add document to the wallet
   * @param {*} options
   * @throws InvalidAccountErrors
   * @returns document
   */
  async add(document: WalletDocument) {
    await this.assertReady();

    const newDocument = {
      ...document,
      id: document.id || uuid(),
      '@context': document.context || this.context,
    };

    await walletService.add(newDocument);

    this.eventManager.emit(WalletEvents.documentAdded, newDocument);

    return newDocument;
  }

  async update(document: WalletDocument) {
    await this.assertReady();

    await walletService.update(document);
    this.eventManager.emit(WalletEvents.documentUpdated, document);
    return document;
  }

  async export(password) {
    return walletService.exportWallet(password);
  }
  /**
   * Add all documents in the wallet
   * @param {*} options
   * @returns document
   */
  async query(
    params: {
      type: DocumentType,
      id: string,
      name: string,
    } = {},
  ): Promise<WalletDocument[]> {
    await this.assertReady();

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

    return walletService.query({
      equals,
    });
  }

  async getDocumentById(documentId) {
    await this.assertReady();

    const result = await this.query({id: documentId});
    return result[0];
  }

  static async create({walletId, json, password} = {}): Wallet {
    const wallet = new Wallet({walletId});

    await wallet.load();

    if (json) {
      await walletService.importWallet({json, password});
    }

    return wallet;
  }

  async importWallet({json, password}) {
    await this.deleteWallet();
    await walletService.importWallet({json, password});
    this.migrated = await migrate({wallet: this});
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

export {Wallet};
