import {substrateService} from '../services/substrate';
import {Accounts} from './accounts';
import {Wallet} from './wallet';
import {getTestWallet} from '../test/setup-test-state';

describe('Accounts module', () => {
  let wallet: Wallet;
  let accounts: Accounts;

  beforeAll(async () => {
    wallet = await getTestWallet();
    await wallet.ensureNetwork();

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
    const name = 'test';
    const mnemonic =
      'young defense crouch puzzle mosquito wire front town trophy assist salt entire';
    const address = '3APujz7DViXXKyh7oKQRR2771aLxMHhh9ZwVadXQZnHSH2kF';

    const account = await accounts.create({
      name: name,
      mnemonic: mnemonic,
    });

    expect(account.getName()).toBe(name);
    expect(account.address).toBe(address);
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
});
