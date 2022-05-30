import {Wallet} from './wallet';
import walletLegacyData from '../test/fixtures/lagacy-wallet-schema.json';

describe('DataMigration', () => {
  let wallet: Wallet;

  beforeAll(async () => {
    global.localStorage.setItem(
      'dock-wallet',
      JSON.stringify(walletLegacyData),
    );
    wallet = await Wallet.create();
    await wallet.ensureNetwork();
  });

  it('expect to create wallet with legacy data', async () => {
    const accounts = await wallet.accounts.getAccounts();
    expect(accounts.length).toBe(2);
  });
});
