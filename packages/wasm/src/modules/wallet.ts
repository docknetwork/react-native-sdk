// @ts-nocheck
import assert from 'assert';
import {v4 as uuid} from 'uuid';
import {getStorage} from '../core/storage';
import {blockchainService} from '../services/blockchain';
import {keyringService} from '../services/keyring';
import {utilCryptoService} from '../services/util-crypto';
import {walletService} from '../services/wallet';
import {DocumentType, WalletDocument} from '../types';
import {Accounts} from './accounts';
import {EventManager} from './event-manager';
import {NetworkManager} from './network-manager';
import {migrate} from './data-migration';
import {Logger} from '../core/logger';
import legacyWalletSchema from '../test/fixtures/legacy-wallet-schema.json';

/** Wallet events */
export const WalletEvents = {
  ready: 'ready',
  error: 'error',
  migrated: 'migrated',
  statusUpdated: 'status-updated',
  documentAdded: 'document-added',
  documentUpdated: 'document-updated',
  documentRemoved: 'document-removed',
  walletDeleted: 'wallet-deleted',
  walletImported: 'wallet-imported',
  networkUpdated: 'network-updated',
  networkConnected: 'network-connected',
  networkError: 'network-error',
};

/**
 * Can be used to debug the data migration behavior in the wallet
 */
const MOCK_STORAGE = process.env.MOCK_STORAGE;

async function shouldMockStorage(walletId) {
  if (MOCK_STORAGE !== 'true') {
    return;
  }

  await getStorage().setItem(walletId, JSON.stringify(legacyWalletSchema));
}

/** Wallet status */
export type WalletStatus = 'closed' | 'loading' | 'ready' | 'error';

// const environment = getEnvironment();

// if (environment !== 'reactnative') {
// require('../setup-nodejs');
// }

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
    walletId = 'wallet',
    context = ['https://w3id.org/wallet/v1'],
  } = {}) {
    this.walletId = walletId;
    this.context = context;
    this.networkManager = NetworkManager.getInstance();
    this.eventManager = new EventManager();
    this.accounts = Accounts.getInstance({wallet: this});
  }

  async recoverFromBadState() {
    const storageItems = await getStorage().getItem(this.walletId);
    const walletData = JSON.parse(storageItems);

    Object.keys(walletData).forEach(docKey => {
      const document = walletData[docKey];
      if (!document['@context']) {
        document['@context'] = this.context;
      }
    });

    await getStorage().setItem(this.walletId, JSON.stringify(walletData));

    await this.createWallet();
  }

  async createWallet() {
    await walletService.create({
      walletId: this.walletId,
      type: 'rpc',
    });

    await walletService.sync();
    await walletService.load();
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

    // TODO: get network from dataStore
    const networkId = (await getStorage().getItem('networkId')) || 'mainnet';
    this.networkManager.setNetworkId(networkId);

    await shouldMockStorage(this.walletId);

    try {
      await utilCryptoService.cryptoWaitReady();
      await keyringService.initialize({
        ss58Format: this.networkManager.getNetworkInfo().addressPrefix,
      });

      try {
        await this.createWallet();
      } catch (err) {
        await this.recoverFromBadState();
      }

      this.setStatus('ready');

      this.eventManager.emit(WalletEvents.ready);

      this.initNetwork();

      this.migrated = await migrate({wallet: this});
      this.eventManager.emit(WalletEvents.migrated);
    } catch (err) {
      this.setStatus('error');
      this.eventManager.emit(WalletEvents.error, err);
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
    await blockchainService.disconnect();
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
    await getStorage().removeItem('logs');
    await getStorage().removeItem('transactions');
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
      const isDockConnected = await blockchainService.isApiConnected();

      if (isDockConnected) {
        await blockchainService.disconnect();
      }

      await blockchainService.init({
        address: networkInfo.substrateUrl,
      });

      this.eventManager.emit(WalletEvents.networkConnected);
    } catch (err) {
      this.eventManager.emit(WalletEvents.error, err);
      throw err;
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

  async upsert(document: WalletDocument) {
    const existing = await this.getDocumentById(document.id);

    if (existing) {
      return this.update({
        ...existing,
        ...document,
      });
    }

    return this.add(document);
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

    await walletService.update({
      '@context': document['@context'] || this.context,
      ...document,
    });
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
      await wallet.importWallet({json, password});
    }

    return wallet;
  }

  async importWallet({json, password}) {
    await this.deleteWallet();
    await walletService.importWallet({json, password});
    this.migrated = await migrate({wallet: this});
    await this.eventManager.emit(WalletEvents.walletImported);
  }
  async getDocumentsFromEncryptedWallet({encryptedJSONWallet, password}) {
    return walletService.getDocumentsFromEncryptedWallet({
      encryptedJSONWallet,
      password,
    });
  }
  async resolveCorrelations(documentId) {
    return walletService.resolveCorrelations(documentId);
  }
  async exportDocuments({documents, password}) {
    return walletService.exportDocuments({
      documents,
      password,
    });
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
