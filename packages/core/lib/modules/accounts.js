import {WalletRpc} from '../client/wallet-rpc';
import {UtilCryptoRpc} from '../client/util-crypto-rpc';
import {KeyringRpc} from '../client/keyring-rpc';
import {ApiRpc} from '../client/api-rpc';
import {Wallet} from './wallet';
import { Errors } from '../errors';

export type KeypairType = 'sr25519' | 'ed25519' |  'ecdsa';

export type Account = {
  id: string;
  name: string;
  type: KeypairType;
  address: string;
}

// TODO: Add events to accounts
export class Accounts {
  accounts: Account[];
  wallet: Wallet;

  constructor() {
    this.accounts = [];
    this.wallet = Wallet.getInstance();
  }

  async load() {
    this.accounts = await Wallet.getInstance().query({
      type: 'account',
    });

    return this.accounts;
  }

  getBalance(address) {
    return ApiRpc.getAccountBalance(accountId);
  }

  getAccounts() {
    return this.accounts;
  }

  generateMnemonic(): Promise<string> {
    return UtilCryptoRpc.mnemonicGenerate(12);
  }

  async create(params: {
    name: string,
    type: KeypairType,
    derivationPath: string,
    mnemonic: string,
  } = {}): Promise<Account> {
   
    const name = params.name;
    const type = params.type || 'sr25519';
    const phrase = params.mnemonic || await this.generateMnemonic();
    const derivePath = params.derivationPath || '';

    const address = await KeyringRpc.addressFromUri({
      phrase,
      type,
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
      type,
      address,
    };

    await this.wallet.add({
      id: address,
      name: account.name,
      type: 'account',
      value: address,
    });

    await this.load();

    return account;
  }

  remove(accountId) {
    this.wallet.remove(accountId);
  }

  static getInstance(): Accounts {
    if (!Accounts.instance) {
      Accounts.instance = new Accounts();
    }

    return Accounts.instance;
  }
}
