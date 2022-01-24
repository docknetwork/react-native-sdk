import {Accounts} from './accounts';

export type AccountDetails = {
  id: string,
  name: string,
  type: KeypairType,
  address: string,
  correlations: any[],
};

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

  static with(address) {
    const account = new Account(address, Accounts.getInstance());

    account.loadPromise = account.loadDetails();

    return account;
  }

  static async withAsync(address) {
    const account = Account.with(address);

    await account.loadPromise;

    return account;
  }

  async loadDetails() {
    this.details = await this.accounts.wallet.getDocumentById(this.address);
    // this.name = this.details.name;
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
