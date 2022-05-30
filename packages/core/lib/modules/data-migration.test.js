import {Wallet} from './wallet';
import {mockDockService} from '../services/test-utils';
import walletLegacyData from '../test/fixtures/lagacy-wallet-schema.json';
import {migrate} from './data-migration';

describe('DataMigration', () => {
  let unmockDockService;
  let wallet: Wallet;

  beforeAll(async () => {
    unmockDockService = await mockDockService();
    global.localStorage.setItem(
      'dock-wallet',
      JSON.stringify(walletLegacyData),
    );
    wallet = await Wallet.create();
    await wallet.ensureNetwork();
  });

  it('expect to create wallet with legacy data', async () => {
    await migrate({wallet});
    const accounts = await wallet.accounts.getAccounts();
    expect(accounts.length).toBe(2);
  });
});
