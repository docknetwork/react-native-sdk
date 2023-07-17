import {Account} from './account';
import {Wallet} from './wallet';
import {NetworkManager} from './network-manager';
import {TestFixtures} from '../fixtures';
import {getTestWallet} from '../test/setup-test-state';

describe('Account', () => {
  let wallet: Wallet;
  let account: Account;

  beforeAll(async () => {
    NetworkManager.getInstance().setNetworkId('testnet');
    wallet = await getTestWallet();
    await wallet.ensureNetwork();
    account = await wallet.accounts.getByAddress(TestFixtures.account1.address);
    await account.loadDetails();
  });

  it('expect to get account name', () => {
    expect(account.getName()).toBe(TestFixtures.account1.name);
  });

  it('expect to get address', () => {
    expect(account.getAddress()).toBe(TestFixtures.account1.address);
  });

  it('expect to get mnemonic phrase', async () => {
    const phrase = await account.getMnemonic();
    expect(phrase).toBe(TestFixtures.account1.mnemonic);
  });

  it('expect to get keyring pair', async () => {
    const pair = await account.getKeyPair();
    expect(pair.address).toBe(TestFixtures.account1.address);
  });

  it('expect to export account', () => {
    const password = '123';
    jest.spyOn(account.accounts, 'exportAccount');
    account.export(password);
    expect(account.accounts.exportAccount).toBeCalledWith(
      account.address,
      password,
    );
  });

  it('expect to remove account', () => {
    jest.spyOn(account.accounts, 'remove');
    account.remove();
    expect(account.accounts.remove).toBeCalledWith(account.address);
  });

  afterAll(() => {
    return wallet.close();
  });
});
