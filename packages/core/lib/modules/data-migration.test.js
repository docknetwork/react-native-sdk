import {Wallet} from './wallet';
import {mockDockService} from '../services/test-utils';
import walletLegacyData from '../test/fixtures/lagacy-wallet-schema.json';
import {getWalletVersion} from './data-migration';

describe('DataMigration', () => {
  describe('migrate wallet from v0.1 to v0.2', () => {
    let unmockDockService;
    let wallet: Wallet;

    beforeAll(async () => {
      unmockDockService = await mockDockService();
      global.localStorage.setItem(
        'dock-wallet',
        JSON.stringify(walletLegacyData),
      );
      wallet = await Wallet.create();

      await wallet.load();
      await wallet.ensureNetwork();
    });

    it('expect to migrate accounts', async () => {
      const accounts = await wallet.accounts.getAccounts();
      expect(accounts.length).toBe(2);
    });

    it('expect wallet version to be the latest', async () => {
      const version = await wallet.getVersion();
      expect(version).toBe('0.2');
      expect(wallet.migrated).toBeTruthy();
    });
  });

  it('expect not to migrate v0.2 wallet', async () => {
    global.localStorage.setItem('dock-wallet', null);
    const wallet = await Wallet.create();

    await wallet.load();
    await wallet.ensureNetwork();

    const accounts = await wallet.accounts.getAccounts();

    expect(accounts.length).toBe(0);
    expect(wallet.migrated).toBeFalsy();
  });
});
