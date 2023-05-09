import {IWallet} from './types';
import {Accounts} from '@docknetwork/wallet-sdk-wasm/lib/modules/accounts';
import {toV1WalletService} from './v1-helpers';

interface ICreateAccountsProvider {
  wallet: IWallet;
}

export async function createAccountProvider({wallet}: ICreateAccountsProvider) {
  const accountsModule = new Accounts({
    wallet: wallet,
    walletService: await toV1WalletService(wallet),
  });

  return accountsModule;
}
