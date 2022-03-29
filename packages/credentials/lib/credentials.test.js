import {Credentials} from './index';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';

describe('Credentials module', () => {
  it('expect to create instance', () => {
    const instance = Credentials.getInstance();
    expect(instance).toBeDefined();
    expect(instance.wallet).toBeInstanceOf(Wallet);
  });

  it('expect to query for credentials', async () => {
    const result = [{value: 1, id: 1}];
    const wallet = {
      query: jest.fn().mockReturnValue(result),
    };
    const credentials = new Credentials({wallet});
    const docs = await credentials.query();

    expect(wallet.query).toBeCalled();
    expect(docs).toHaveLength(result.length);
    expect(docs).toStrictEqual([
      {
        content: 1,
        id: 1,
      },
    ]);
  });

  it('expect to add credential to the wallet', async () => {
    const input = {
      credentialData: 1,
    };
    const walletDocResult = {
      value: input.content,
      id: 1,
    };
    const wallet = {
      add: jest.fn().mockReturnValue(walletDocResult),
    };
    const credentials = new Credentials({wallet});

    await credentials.add(input);

    expect(wallet.add).toBeCalledWith({
      type: 'VerifiableCredential',
      value: input,
    });
  });

  it('expect to remove credential from the wallet', async () => {
    const credential = {
      content: 'data',
      id: 1,
    };
    const removalResult = true;
    const wallet = {
      remove: jest.fn().mockReturnValue(removalResult),
    };
    const credentials = new Credentials({wallet});
    const result = await credentials.remove(credential.id);

    expect(result).toBe(removalResult);
    expect(wallet.remove).toBeCalledWith(credential.id);
  });
});
