// @ts-nocheck
import assert from 'assert';
import {walletService as _walletService} from '../services/wallet';
import {utilCryptoService} from '../services/util-crypto';
import {keyringService} from '../services/keyring';
import {substrateService} from '../services/substrate';
import {polkadotService} from '../services/polkadot';
import {Wallet, WalletEvents} from './wallet';
import {Errors} from '../errors';
import {
  KeypairType,
  WalletDocument,
  DocumentType,
  KeypairTypes,
} from '../types';
import {EventManager} from './event-manager';
import {AccountDetails, Account} from './account';
import {isAddressValid} from '../core/validation';

export const AccountsEvents = {
  loaded: 'loaded',
  accountCreated: 'account-added',
  accountUpdated: 'account-updated',
  accountRemoved: 'account-removed',
};

export type CreateAccountParams = {
  name: string,
  type: KeypairType,
  derivationPath: string,
  mnemonic: string,
  json: string,
  password: string,
  getIfExists: boolean,
};

export class Accounts {
  accounts: AccountDetails[];
  wallet: Wallet;
  eventManager: EventManager;
  static DocumentFilters = {
    mnemonicType: (item: WalletDocument) => item.type === 'Mnemonic',
    currencyType: (item: WalletDocument) => item.type === 'Currency',
  };

  constructor({wallet, walletService} = {}) {
    this.accounts = [];
    this.wallet = wallet || Wallet.getInstance();
    this.walletService = walletService || _walletService;
    this.eventManager = new EventManager();
  }

  async load() {
    this.accounts = await this.wallet.query({
      type: 'Address',
    });
    this.eventManager.emit(AccountsEvents.loaded);
    return this.accounts;
  }

  async exportAccount(address, password) {
    return this.walletService.exportAccount({address, password});
  }

  async importAccount(json, password) {
    return this.create({
      json,
      password,
    });
  }

  async fetchBalance(address) {
    assert(isAddressValid(address), 'invalid address');
    console.log('fetching balance from substrate');
    let balance;

    try {
      balance = await substrateService.getAccountBalance({address});

      console.log('balance found', balance.toString());

      console.log('updating cache');
      const currency = await this.findCorrelationByType(
        address,
        'Currency',
        true,
      );

      console.log('currency', currency);

      if (currency.value !== balance) {
        currency.value = balance;

        await this.wallet.update(currency);
      }
    } catch(err) {
      console.log('Unable to update cache');
      console.error(err); 
    }

    return balance;
  }

  async getBalance(address, skipFetch?) {
    assert(isAddressValid(address), 'address is required');

    if (!skipFetch) {
      await this.fetchBalance(address);
    }

    const currency = await this.findCorrelationByType(
      address,
      'Currency',
      true,
    );

    return currency.value;
  }

  getAccounts() {
    return this.accounts;
  }

  getAccountIcon(address: string, isAlternative: boolean): Promise<any> {
    return polkadotService.getPolkadotSvgIcon(address, isAlternative);
  }

  async getByAddress(address: string): Promise<AccountDetails> {
    return Account.with(address);
  }

  async findCorrelationByType(
    address: string,
    type: DocumentType,
    assertResult: boolean,
  ) {
    assert(isAddressValid(address), 'invalid address');

    const correlations = await this.wallet.resolveCorrelations(address);
    const result = correlations.find(c => c.type.includes(type));

    if (assertResult) {
      assert(!!result, `${type} document not found for the account ${address}`);
    }

    return result;
  }

  generateMnemonic(): Promise<string> {
    return utilCryptoService.mnemonicGenerate(12);
  }

  async update(account: AccountDetails) {
    assert(!!account, 'account is required');

    await this.walletService.update(account);
    this.eventManager.emit(AccountsEvents.accountUpdated);
    await this.load();
  }

  async getOrCreate(params: CreateAccountParams) {
    return this.create({
      ...params,
      getIfExists: true,
    });
  }

  async create(params: CreateAccountParams): Promise<Account> {
    let {name, json, password, type = 'sr25519', getIfExists} = params;

    assert(!!name, 'name is required');
    assert(!!type, 'keypair type is required');
    assert(
      KeypairTypes.find(t => t === type),
      `invalid keypair type ${type}`,
    );

    if (json) {
      assert(typeof password === 'string', 'password is required');
    }

    const mnemonic =
      params.mnemonic || (!json && (await this.generateMnemonic()));
    const derivePath = params.derivationPath || '';

    const address = json
      ? json.address
      : await keyringService.addressFromUri({
          mnemonic,
          type,
          derivePath,
        });

    const existingAccountDocs = await this.wallet.query({
      id: address,
    });

    const accountExists = existingAccountDocs.length > 0;

    if (getIfExists && accountExists) {
      return this.getByAddress(address);
    }

    assert(!accountExists, Errors.accountAlreadyExists);

    if (json) {
      const pair = await keyringService.decryptKeyPair({
        jsonData: json,
        password,
      });

      assert(pair && pair.address, 'invalid keypair');

      type = pair.type;
    }

    const account: AccountDetails = {
      id: address,
      name,
      type,
      address,
    };

    const documents = await this.walletService.createAccountDocuments({
      name,
      type,
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

    return Account.withAsync(account.address, this);
  }

  async remove(accountId) {
    await this.wallet.remove(accountId);

    // remove other documents
    // mnemonic phrase and all the stuff

    this.eventManager.emit(AccountsEvents.accountRemoved, accountId);

    this.load();
  }

  static getInstance(options): Accounts {
    if (!Accounts.instance || options) {
      Accounts.instance = new Accounts(options);
    }

    return Accounts.instance;
  }
}
