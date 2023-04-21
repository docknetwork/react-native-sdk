/**
 * Wallet data store v1 uses localStorage to store data
 * This integration test injects into the localStorage a test snapshot
 * And ensure the wallet-sdk can load the data and perform operations
 */

import {
  assertAccountIsValid,
  cleanup,
  createWalletFromSnapshot,
  getAccounts,
  getWallet,
  setupEnvironent,
} from './helpers';

describe('Wallet Snapshot V1', () => {
  beforeAll(async () => {
    await cleanup();
    await setupEnvironent();
    await createWalletFromSnapshot();
  });

  it('expect to have load all documents', async () => {
    const documents = await getWallet().query({});
    expect(documents.length).toBe(9);
  });

  it('expect to have load accounts', async () => {
    const accounts = await getAccounts();
    expect(accounts.length).toBe(1);

    const [account] = accounts;

    expect(account.address).toBe(
      '37NKEP14n9omsAgxJ3sn14XtHo2vs5a34UcpCyybXQJoUQ92',
    );

    await assertAccountIsValid(account.address);
  });

  it('expect to have loaded DIDs', async () => {});

  it('expect to have loaded credentials', async () => {});

  it('expect to have loaded Verification Templates', async () => {});
});
