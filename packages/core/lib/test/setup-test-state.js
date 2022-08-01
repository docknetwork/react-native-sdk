import {TestFixtures} from '../fixtures';
import { NetworkManager } from '../modules/network-manager';
import {Wallet} from '../modules/wallet';
import { dockService } from '../services/dock';
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

  const nInfo = NetworkManager.getInstance().getNetworkInfo();

  await dockService.init({
    address: NetworkManager.getInstance().getNetworkInfo().substrateUrl,
  });

  return wallet;
}
