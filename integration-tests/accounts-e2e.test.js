import {Accounts} from '@docknetwork/wallet-sdk-core/lib/modules/accounts';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import { NetworkManager } from '../packages/core/lib/modules/network-manager';


describe('Accounts integration test', () => {
  let accounts = Accounts.getInstance();

  beforeAll(async() => {
      await Wallet.getInstance().load();
      await accounts.load();
  });

  it('Expect to create accounts', async () => {
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
});
