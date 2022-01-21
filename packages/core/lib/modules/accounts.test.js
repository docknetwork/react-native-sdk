import {ApiRpc} from '../client/api-rpc';
import {Accounts} from './accounts';
import {Wallet} from './wallet';

describe('Accounts module', () => {
  let accounts = Accounts.getInstance();

  beforeAll(async () => {
    await Wallet.getInstance().load();
    await accounts.load();
  });

  it('Expect to create account', async () => {
    const name = 'Test account';
    const account = await accounts.create({
      name,
    });
    const foundDocument = accounts
      .getAccounts()
      .find(item => item.id === account.id);

    expect(account.name).toBe(name);
    expect(account.id).toBeDefined();
    expect(foundDocument.id).toBe(account.id);
  });

  it('Expect to create accounts with existing mnemonic', async () => {
    const name = 'Test account';
    const mnemonic =
      'satisfy stadium what pizza blind monitor priority prize found glance stock snow';
    const expectedAddress = '37gNXoHSnDToA4UTQtgh8NdzjPcZ2CDZAqAcHuT1VweWAJaV';
    const account = await accounts.create({
      name,
      mnemonic,
    });

    expect(account.name).toBe(name);
    expect(account.id).toBe(expectedAddress);
    expect(account.address).toBe(expectedAddress);
  });

  it('expect to fetch account balance and update currency document', async () => {
    const account = await accounts.create({});
    const balance = 10;
    jest.spyOn(ApiRpc, 'getAccountBalance').mockReturnValue(balance);

    let result = await accounts.fetchBalance(account.id);

    expect(ApiRpc.getAccountBalance).toBeCalled();
    expect(result).toBe(balance);

    const currency = await accounts.findCorrelationByType(
      account.id,
      'Currency',
    );

    expect(currency.value).toBe(balance);

    result = await accounts.getBalance(account.id);

    expect(result).toBe(balance);
  });

  it('Expect to export account and import account', async () => {
    const account = await accounts.create({});
    const json = await accounts.exportAccount(account.id, 'test');

    expect(json.address).toBe(account.address);

    await accounts.remove(account.id);

    const account2 = await accounts.create({
      json,
      password: 'test',
    });

    expect(account2.address).toBe(account.address);
  });

  afterAll(async() => {
    await Wallet.getInstance().close();
  });
});
