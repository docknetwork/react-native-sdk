import assert from 'assert';
import {isAddressValid} from '../core/validation';
import {Accounts} from './accounts';

export type AccountDetails = {
  id: string,
  name: string,
  type: KeypairType,
  address: string,
  correlations: any[],
};

/**
 * Account
 */
export class Account {
  details: AccountDetails;
  address: string;
  name: string;
  accounts: Accounts;

  constructor(address: string, accounts: Accounts) {
    this.accounts = accounts;
    this.address = address;
    this.id = address;
  }

  /**
   * Get account for a given address
   * The account needs to exist in the wallet
   *
   * @example
   * const accounts = Account.with('some-address')
   * @param {string} address
   * @returns
   */
  static with(address, accounts) {
    assert(isAddressValid(address), 'invalid address');

    const account = new Account(address, accounts || Accounts.getInstance());

    account.loadPromise = account.loadDetails();

    return account;
  }

  /**
   *
   * @param {string} address
   * @returns
   */
  static async withAsync(address, accounts) {
    const account = Account.with(address, accounts);

    await account.loadPromise;

    return account;
  }

  /**
   * @returns {Promise<void>}
   */
  async loadDetails() {
    this.details = await this.accounts.wallet.getDocumentById(this.id);
    this.name = this.details && this.details.name;
  }

  getAddress() {
    return this.details.address;
  }

  getDetails(): AccountDetails {
    return this.details;
  }

  async getBalance(skipFetch?) {
    return this.accounts.getBalance(this.details.address, skipFetch);
  }

  export(password: string) {
    return this.accounts.exportAccount(this.address, password);
  }

  remove() {
    return this.accounts.remove(this.address);
  }

  update({name}) {
    return this.accounts.update({
      ...this.details,
      name,
    });
  }

  async getMnemonic() {
    const doc = await this.accounts.findCorrelationByType(
      this.address,
      'Mnemonic',
    );
    return doc.value;
  }

  async getKeyPair() {
    const doc = await this.accounts.findCorrelationByType(
      this.address,
      'KeyringPair',
    );
    return doc.value;
  }

  getName(): string {
    return this.details.name;
  }

  getIcon(isAlternative?: boolean): Promise<any> {
    return this.accounts.getAccountIcon(this.details.address, isAlternative);
  }
}
