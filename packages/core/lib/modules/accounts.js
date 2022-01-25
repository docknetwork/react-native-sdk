import assert from 'assert';
import {WalletRpc} from '../client/wallet-rpc';
import {UtilCryptoRpc} from '../client/util-crypto-rpc';
import {KeyringRpc} from '../client/keyring-rpc';
import {ApiRpc} from '../client/api-rpc';
import {Wallet, WalletEvents} from './wallet';
import {Errors} from '../errors';
import {KeypairType, WalletDocument, DocumentType} from '../types';
import {EventManager} from './event-manager';
import {PolkadotUIRpc} from '../client/polkadot-ui-rpc';
import {AccountDetails, Account} from './account';

export const AccountsEvents = {
  loaded: 'loaded',
  accountCreated: 'account-added',
  accountUpdated: 'account-updated',
  accountRemoved: 'account-removed',
};

export class Accounts {
  accounts: AccountDetails[];
  wallet: Wallet;
  eventManager: EventManager;
  static DocumentFilters = {
    mnemonicType: (item: WalletDocument) => item.type === 'Mnemonic',
    currencyType: (item: WalletDocument) => item.type === 'Currency',
  };

  constructor({wallet} = {}) {
    this.accounts = [];
    this.wallet = wallet || Wallet.getInstance();
    this.eventManager = new EventManager();
    this.eventManager.registerEvents(AccountsEvents);
  }

  async load() {
    this.accounts = await this.wallet.query({
      type: 'Address',
    });
    this.eventManager.emit(AccountsEvents.loaded);
    return this.accounts;
  }

  async exportAccount(address, password) {
    return WalletRpc.exportAccount(address, password);
  }

  async importAccount(json, password) {
    return this.create({
      json,
      password,
    });
  }

  async fetchBalance(accountId) {
    const account = await this.getByAddress(accountId);
    const balance = await ApiRpc.getAccountBalance(account.address);
    const currency = await this.findCorrelationByType(accountId, 'Currency');

    currency.value = balance;

    await this.wallet.update(currency);

    return balance;
  }

  async getBalance(address, skipFetch?) {
    assert(!!address, 'address is required');

    if (!skipFetch) {
      await this.fetchBalance(address);
    }

    const currency = await this.findCorrelationByType(address, 'Currency');

    if (!currency) {
      throw new Error(
        `currency object was not found for the address ${address}`,
      );
    }

    return currency.value;
  }

  getAccounts() {
    return this.accounts;
  }

  getAccountIcon(address: string, isAlternative: boolean): Promise<any> {
    return PolkadotUIRpc.getPolkadotSvgIcon(address, isAlternative);
  }

  async getByAddress(address: string): Promise<AccountDetails> {
    return Account.with(address);
  }

  async findCorrelationByType(address: string, type: DocumentType) {
    assert(typeof address === 'string', 'invalid adress');

    const correlations = await WalletRpc.resolveCorrelations(address);
    return correlations.find(c => c.type === type);
  }

  generateMnemonic(): Promise<string> {
    return UtilCryptoRpc.mnemonicGenerate(12);
  }

  async update(account: AccountDetails) {
    await WalletRpc.update(account);
    this.eventManager.emit(AccountsEvents.accountUpdated);
    await this.load();
  }

  async create(
    params: {
      name: string,
      keyPairType: KeypairType,
      derivationPath: string,
      mnemonic: string,
      json: string,
      password: string,
    } = {},
  ): Promise<Account> {
    let {name, json, password, keyPairType = 'sr25519'} = params;
    const mnemonic =
      params.mnemonic || (!json && (await this.generateMnemonic()));
    const derivePath = params.derivationPath || '';

    const address = json
      ? json.address
      : await KeyringRpc.addressFromUri({
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

    if (json) {
      const pair = await KeyringRpc.addFromJson(json, password);

      if (!pair || !pair.type) {
        throw new Error('invalid keypair');
      }

      keyPairType = pair.type;
    }

    const account: AccountDetails = {
      id: address,
      name,
      keyPairType,
      address,
    };

    const documents = await WalletRpc.createAccountDocuments({
      name,
      keyPairType,
      derivePath,
      mnemonic,
      json,
      password,
    });

    documents.forEach(doc => {
      this.wallet.eventManager.emit(WalletEvents.documentAdded, doc);
    });

    this.eventManager.emit(AccountsEvents.accountCreated, account);

    await this.load();

    return Account.withAsync(account.address);
  }

  async remove(accountId) {
    await this.wallet.remove(accountId);

    this.eventManager.emit(AccountsEvents.accountRemoved, accountId);

    this.load();
  }

  static getInstance(options = {}): Accounts {
    if (!Accounts.instance) {
      Accounts.instance = new Accounts(options);
    }

    return Accounts.instance;
  }
}
