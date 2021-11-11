import { WalletRpc } from "../client/wallet-rpc";


export class Wallet {
  async load() {
    await WalletRpc.create('dock-wallet');
    await WalletRpc.load();
  }
  
  remove() {
    return WalletRpc.remove('dock-wallet');
  }
  
  query(options) {
    return WalletRpc.query(options);
  }
  
  static getInstance(): Wallet {
    if (!Wallet.instance) {
      Wallet.instance = new Wallet();
    }

    return Wallet.instance;
  }
}