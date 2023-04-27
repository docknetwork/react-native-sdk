import {
  cleanup,
  createAccounts,
  createNewWallet,
  setupEnvironent,
} from './helpers';

describe('Switch wallet', () => {
  beforeAll(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
    await createAccounts();
  });

  it('expect to import data in the mainnet wallet', () => {});

  it('expect switch to tesnet and have an empty wallet', () => {});

  it('expect switch to tesnet and have an empty wallet', () => {});
});
