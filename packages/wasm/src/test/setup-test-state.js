import {TestFixtures} from '../fixtures';
import {NetworkManager} from '../modules/network-manager';
import {Wallet} from '../modules/wallet';
import {blockchainService} from '../services/blockchain';
import promiseMemoize from 'promise-memoize';
import {setStorage} from '../core/storage';

export const getTestWallet: Wallet = promiseMemoize(async () => {
  setStorage(global.localStorage);

  const wallet = Wallet.getInstance();

  await wallet.load();
  await wallet.deleteWallet();
  await wallet.accounts.create({
    name: TestFixtures.account1.name,
    mnemonic: TestFixtures.account1.mnemonic,
  });

  await wallet.accounts.create({
    name: TestFixtures.account2.name,
    mnemonic: TestFixtures.account2.mnemonic,
  });

  await wallet.accounts.create({
    name: TestFixtures.noBalanceAccount.name,
    mnemonic: TestFixtures.noBalanceAccount.mnemonic,
  });

  await blockchainService.init({
    cheqdApiUrl: NetworkManager.getInstance().getNetworkInfo().cheqdApiUrl,
  });

  return wallet;
});
