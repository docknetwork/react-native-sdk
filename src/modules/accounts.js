import { WalletRpc } from "../client/wallet-rpc";
import {ApiRpc} from '../'
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
  
  getBalance(address) {
    return ApiRpc.getAccountBalance(accountId);
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