import {IWallet} from './types';
import {Accounts} from '@docknetwork/wallet-sdk-wasm/src/modules/accounts';
import {toV1WalletService} from './v1-helpers';

interface ICreateAccountsProvider {
  wallet: IWallet;
}

export function createAccountProvider({wallet}: ICreateAccountsProvider) {
  const accountsModule = new Accounts({
    wallet: wallet,
    walletService: toV1WalletService(wallet),
  });

  Accounts.instance = accountsModule;

  return accountsModule;
}
