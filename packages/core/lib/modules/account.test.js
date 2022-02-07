import {Account} from './account';
import {Wallet} from './wallet';
import {TestFixtures} from '../fixtures';

describe('Account', () => {
  let wallet: Wallet;
  let account: Account;

  beforeAll(async () => {
    wallet = await Wallet.create();
    account = await wallet.accounts.create({
      name: TestFixtures.account1.name,
      mnemonic: TestFixtures.account1.mnemonic,
    });

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

  it('expect to get balance', () => {
    jest.spyOn(account.accounts, 'getBalance');
    account.getBalance();
    expect(account.accounts.getBalance).toBeCalledWith(
      account.address,
      undefined,
    );
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
