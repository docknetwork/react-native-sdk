import {TestFixtures} from '../fixtures';
import ApiService from './api';
import DockService from './dock';
import {initializeWalletService} from './test-utils';
import WalletService from './wallet';

describe('ApiService', () => {
  beforeAll(async () => {
    await initializeWalletService();
    await DockService.routes.init({
      address: 'wss://knox-1.dock.io',
    });

    await WalletService.routes.createAccountDocuments({
      name: 'account1',
      mnemonic: TestFixtures.account1.mnemonic,
      keyPairType: 'sr25519',
    });
  });

  it('Get account balance', async () => {
    const balance = await ApiService.routes.getAccountBalance(
      TestFixtures.account1.address,
    );

    expect(parseInt(balance, 10) >= 0).toBeTruthy();
  });

  it('Get transaction fee amount', async () => {
    const fee = await ApiService.routes.getFeeAmount({
      toAddress: '37GfhtNUJk1aJhXuGxNJsAGenteDBX3DTVAvuBZm49Kqc9wA',
      fromAddress: TestFixtures.account1.address,
      amount: '1000',
    });

    expect(parseInt(fee, 10)).toBeGreaterThanOrEqual(1000);
  });
});
