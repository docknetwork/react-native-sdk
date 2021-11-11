import { WalletRpc } from "../client/wallet-rpc";
import { Wallet } from "./wallet";


export class Accounts {
  constructor() {
    this.accounts = [];
  }

  async load() {
    this.accounts = await Wallet.getInstance().query({
      equals: {
        'content.type': 'Account',
      },
    });

    return this.accounts;
  }

  getAccounts() {
    return this.accounts;
  }

  remove() {
    return WalletRpc.remove('dock-wallet');
  }
  
  static getInstance(): Wallet {
    if (!Accounts.instance) {
      Accounts.instance = new Accounts();
    }

    return Accounts.instance;
  }
}