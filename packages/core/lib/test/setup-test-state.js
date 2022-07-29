import {TestFixtures} from '../fixtures';
import {Wallet} from '../modules/wallet';
import {mockDockService} from '../services/test-utils';

export async function getTestWallet(): Wallet {
  await mockDockService();
  const wallet = Wallet.getInstance();

  await wallet.load();
  await wallet.deleteWallet();

  await wallet.accounts.create({
    name: TestFixtures.account1.name,
    mnemonic: TestFixtures.account1.mnemonic,
  });

  return wallet;
}
