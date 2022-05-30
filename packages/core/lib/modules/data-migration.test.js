import {Wallet} from './wallet';
import {mockDockService} from '../services/test-utils';
import walletLegacyData from '../test/fixtures/lagacy-wallet-schema.json';
import { getWalletVersion } from './data-migration';

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

    await wallet.load();
    await wallet.ensureNetwork();
  });

  it('expect to create migrate wallet from 0.1 to 0.2', async () => {
    const accounts = await wallet.accounts.getAccounts();
    expect(accounts.length).toBe(2);
  });

  it('expect allet version to be the latest', async () => {
    const version = await wallet.getVersion();
    expect(version).toBe('0.2');
  });

  // afterAll(() => {
  //   unmockDockService();
  // });
});
