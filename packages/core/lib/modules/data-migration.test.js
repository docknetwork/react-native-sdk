import {Wallet} from './wallet';
import walletLegacyData from '../test/fixtures/legacy-wallet-schema.json';
import {mockDockService} from '../services/test-utils';

describe('DataMigration', () => {
  let unmockDockService;

  beforeAll(async () => {
    unmockDockService = await mockDockService();
  });

  describe('migrate wallet from v0.1 to v0.2 (file1)', () => {
    let wallet: Wallet;

    beforeAll(async () => {
      global.localStorage.setItem(
        'import-test',
        JSON.stringify(walletLegacyData),
      );
      wallet = await Wallet.create({walletId: 'import-test'});
      await wallet.load();
      await wallet.ensureNetwork();
    });

    // TODO: Check why test is failing
    // it('expect to migrate accounts', async () => {
    //   const accounts = await wallet.accounts.getAccounts();
    //   expect(accounts.length).toBe(3);
    //   expect(wallet.migrated).toBeTruthy();
    // });

    it('expect wallet version to be the latest', async () => {
      const version = await wallet.getVersion();
      expect(version).toBe('0.2');
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

  it('expect to recover wallet from missing @context on documents', async () => {
    global.localStorage.setItem(
      'bad-documents',
      JSON.stringify({
        'doc:d4bd8145-4a56-456e-9b78-71509184f6ed': {
          // bad context data
          '@context': null,
          id: '6ee76a80-bdf2-4cf8-9647-4897ed6feadd',
          name: 'Account 1',
          type: 'Address',
          value: 'some address',
        },
      }),
    );
    const wallet = await Wallet.create({walletId: 'bad-documents'});
    await wallet.load();
  });

  afterAll(() => {
    return unmockDockService();
  });
});
