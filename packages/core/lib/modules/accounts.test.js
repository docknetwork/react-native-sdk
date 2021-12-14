import {Accounts} from './accounts';
import {Wallet} from './wallet';

describe('Accounts module', () => {
  let accounts = Accounts.getInstance();

  beforeAll(async() => {
      await Wallet.getInstance().load();
      await accounts.load();
  });

  it('Expect to create account', async () => {
    const name = 'Test account';
    const account = await accounts.create({
      name
    });
    const foundDocument = accounts.getAccounts().find(item => item.id === account.id);

    expect(account.name).toBe(name);
    expect(account.id).toBeDefined();
    expect(foundDocument.id).toBe(account.id);
  });

  it('Expect to create accounts with existing mnemonic', async () => {
    const name = 'Test account';
    const mnemonic = 'satisfy stadium what pizza blind monitor priority prize found glance stock snow';
    const expectedAddress = '37gNXoHSnDToA4UTQtgh8NdzjPcZ2CDZAqAcHuT1VweWAJaV';
    const account = await accounts.create({
      name,
      mnemonic,
    });

    expect(account.name).toBe(name);
    expect(account.id).toBe(expectedAddress);
    expect(account.address).toBe(expectedAddress);
  });

  it('Expect to export account', async () => {
    const account = await accounts.create({
      name,
    });

    // const jsonData = accounts.export(account.id);

    // expect(jsonData).toBeDefined();
    // expect(jsonData.address).toBe(account.address);
  });
});
