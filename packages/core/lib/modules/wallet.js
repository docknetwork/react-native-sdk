import {WalletRpc} from '../client/wallet-rpc';
import {v4 as uuid} from 'uuid';
import {KeyringRpc} from '../client/keyring-rpc';
import {UtilCryptoRpc} from '../client/util-crypto-rpc';
import {NetworkManager} from './network-manager';
import {initRealm} from '../core/realm';
import {ApiRpc} from '../client/api-rpc';
import {DockRpc} from '../client/dock-rpc';
import {EventManager} from './event-manager';

export type DocumentType =
  | 'mnemonic'
  | 'credential'
  | 'account'
  | 'did'
  | 'generic';

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

export type WalletDocument = {
  context?: string[],
  id?: any,
  name: any,
  type: DocumentType,
  value: any,
};

export const WalletEvents = {
  ready: 'ready',
  documentAdded: 'document-added',
  documentRemoved: 'document-removed',
};

export type WalletStatus = 'closed' | 'loading' | 'ready';

/** Wallet */
export class Wallet {
  networkManager: NetworkManager;
  context: string[];
  status: WalletStatus;
  eventManager: EventManager;

  constructor() {
    this.context = ['https://w3id.org/wallet/v1'];
    this.networkManager = NetworkManager.getInstance();
    this.eventManager = new EventManager();

    this.eventManager.registerEvents(WalletEvents);
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
    await WalletRpc.create('dock-wallet');
    await WalletRpc.load();

    const networkInfo = this.networkManager.getNetworkInfo();
    await KeyringRpc.initialize({
      ss58Format: networkInfo.addressPrefix,
    });

    const isDockConnected = await DockRpc.isApiConnected();
    if (!isDockConnected) {
      await DockRpc.init({
        address: networkInfo.substrateUrl,
      });
    }

    this.status = 'ready';
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
    const query = {};
    const equals = {};

    if (params.type) {
      equals['content.type'] = params.type;
    }

    if (params.id) {
      equals['content.id'] = params.id;
    }

    if (params.name) {
      equals['content.name'] = params.name;
    }

    return WalletRpc.query({
      equals,
    });
  }

  async getDocumentById(documentId) {
    const result = await this.query({id: documentId});
    return result[0];
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
