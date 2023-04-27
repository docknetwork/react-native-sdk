import {Wallet} from '../modules/wallet';
import {getTestWallet} from './setup-test-state';

describe('Test wallet', () => {
  let wallet: Wallet;

  beforeAll(async () => {
    wallet = await getTestWallet();
  });

  it('expect to have created the created', async () => {
    const accounts = await wallet.accounts.getAccounts();
    expect(accounts.length).toBe(3);
  });
});
