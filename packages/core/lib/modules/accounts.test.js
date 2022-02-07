import { substrateService } from '../services/substrate';
import {TestFixtures} from '../fixtures';
import {Accounts} from './accounts';
import {Wallet} from './wallet';

describe('Accounts module', () => {
  let wallet: Wallet;
  let accounts: Accounts;

  beforeAll(async () => {
    wallet = await Wallet.create();
    accounts = wallet.accounts;
  });

  it('Expect to create account', async () => {
    const name = 'Test account';
    const account = await accounts.create({
      name,
    });
    const foundDocument = accounts
      .getAccounts()
      .find(item => item.id === account.address);

    expect(account.name).toBe(name);
    expect(account.address).toBeDefined();
    expect(foundDocument.id).toBe(account.address);
  });

  it('Expect to create accounts with existing mnemonic', async () => {
    const account = await accounts.create({
      name: TestFixtures.account1.name,
      mnemonic: TestFixtures.account1.mnemonic,
    });

    expect(account.getName()).toBe(TestFixtures.account1.name);
    expect(account.address).toBe(TestFixtures.account1.address);
  });

  it('expect to fetch account balance and update currency document', async () => {
    const account = await accounts.create({
      name: 'test',
    });
    const balance = 10;
    jest.spyOn(substrateService, 'getAccountBalance').mockReturnValue(balance);

    let result = await accounts.fetchBalance(account.address);

    expect(substrateService.getAccountBalance).toBeCalled();
    expect(result).toBe(balance);

    const currency = await accounts.findCorrelationByType(
      account.address,
      'Currency',
    );

    expect(currency.value).toBe(balance);

    result = await accounts.getBalance(account.address);

    expect(result).toBe(balance);
  });

  it('Expect to export account and import account', async () => {
    const account = await accounts.create({
      name: 'test',
    });
    const json = await accounts.exportAccount(account.address, 'test');

    expect(json.address).toBe(account.address);

    await accounts.remove(account.address);

    const account2 = await accounts.create({
      name: 'json account',
      json,
      password: 'test',
    });

    expect(account2.address).toBe(account.address);
  });

  afterAll(async () => {
    await wallet.close();
  });
});
