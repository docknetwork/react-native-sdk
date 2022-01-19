import {WalletRpc} from '../client/wallet-rpc';
import {UtilCryptoRpc} from '../client/util-crypto-rpc';
import {KeyringRpc} from '../client/keyring-rpc';
import {ApiRpc} from '../client/api-rpc';
import {Wallet, WalletEvents} from './wallet';
import { Errors } from '../errors';
import {KeypairType, WalletDocument} from '../types';
import { EventManager } from './event-manager';

export type Account = {
  id: string;
  name: string;
  type: KeypairType;
  address: string;
}

export const AccountsEvents = {
  loaded: 'loaded',
  accountCreated: 'account-added',
  accountUpdated: 'account-updated',
  accountRemoved: 'account-removed',
};

// TODO: Add events to accounts
export class Accounts {
  accounts: Account[];
  wallet: Wallet;
  eventManager: EventManager;
  static DocumentFilters = {
    mnemonicType: (item: WalletDocument) => item.type === 'Mnemonic',
    currencyType: (item: WalletDocument) => item.type === 'Currency',
  }

  constructor() {
    this.accounts = [];
    this.wallet = Wallet.getInstance();
    this.eventManager = new EventManager();
    this.eventManager.registerEvents(AccountsEvents);
  }

  async load() {
    this.accounts = await Wallet.getInstance().query({
      type: 'Address',
    });
    this.eventManager.emit(AccountsEvents.loaded);
    return this.accounts;
  }

  async exportAccount(accountId, password) {
    return WalletRpc.exportAccount(
      accountId,
      password,
    );
  }

  getBalance(address) {
    return ApiRpc.getAccountBalance(accountId);
  }

  getAccounts() {
    return this.accounts;
  }
  
  async getAccount(accountId) {
    const accountDocument = await Wallet.getInstance().getDocumentById(accountId);

    return {
      ...accountDocument,
      correlations: await WalletRpc.resolveCorrelations(accountId)
    }
  }

  generateMnemonic(): Promise<string> {
    return UtilCryptoRpc.mnemonicGenerate(12);
  }

  async update(account: Account) {
    await WalletRpc.update(account);
    this.eventManager.emit(AccountsEvents.accountUpdated);
    await this.load();
  }

  async create(params: {
    name: string,
    keyPairType: KeypairType,
    derivationPath: string,
    mnemonic: string,
  } = {}): Promise<Account> {
   
    const name = params.name;
    const keyPairType = params.keyPairType || 'sr25519';
    const mnemonic = params.mnemonic || await this.generateMnemonic();
    const derivePath = params.derivationPath || '';

    const address = await KeyringRpc.addressFromUri({
      mnemonic,
      keyPairType,
      derivePath,
    });

    const existingAccounts = await this.wallet.query({
      id: address,
    });

    if (existingAccounts.length > 0) {
      throw new Error(Errors.accountAlreadyExists);
    }

    const account: Account = {
      id: address,
      name,
      keyPairType,
      address,
    };

    const documents = await WalletRpc.createAccountDocuments({
      name,
      keyPairType,
      derivePath,
      mnemonic 
    });

    documents.forEach(doc => {
      this.wallet.eventManager.emit(WalletEvents.documentAdded, doc);
    });

    this.eventManager.emit(AccountsEvents.accountCreated, account);

    await this.load();
    return account;
  }

  async remove(accountId) {
    await this.wallet.remove(accountId);
    
    this.eventManager.emit(AccountsEvents.accountRemoved, accountId);
    
    this.load();
  }

  static getInstance(): Accounts {
    if (!Accounts.instance) {
      Accounts.instance = new Accounts();
    }

    return Accounts.instance;
  }
}
