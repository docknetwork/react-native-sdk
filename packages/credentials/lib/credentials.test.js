import {Credentials} from './index';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import testCredential from '../fixtures/test-credential.json';
import {getPromiseError} from '@docknetwork/wallet-sdk-core/lib/services/test-utils';

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
    const walletDocResult = {
      value: testCredential,
      id: 1,
    };
    const wallet = {
      add: jest.fn().mockReturnValue(walletDocResult),
    };
    const credentials = new Credentials({wallet});

    await credentials.add(testCredential);

    expect(wallet.add).toBeCalledWith({
      type: 'VerifiableCredential',
      value: testCredential,
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

  describe('add from url', () => {
    const wallet = {
      add: jest.fn().mockReturnValue({
        id: 1,
        value: testCredential,
      }),
    };
    const credentials = new Credentials({wallet});

    it('fetch data from url', async () => {
      const url =
        'https://creds.dock.io/1d28317eb63495340414fb11346d5b7f5fd50b65aa06c8064d88ec3ec993a29b?p=dGVzdA%3D%3D';
      const data = await credentials.fetchData(url);
      expect(data).toStrictEqual(testCredential);
    });

    it('getCredentialFromUrl', async () => {
      const url =
        'https://creds.dock.io/1d28317eb63495340414fb11346d5b7f5fd50b65aa06c8064d88ec3ec993a29b?p=dGVzdA%3D%3D';
      const data = await credentials.getCredentialFromUrl(url);
      expect(data).toStrictEqual(testCredential);
    });

    it('Expect to download credential', async () => {
      const url =
        'https://creds.dock.io/1d28317eb63495340414fb11346d5b7f5fd50b65aa06c8064d88ec3ec993a29b?p=dGVzdA%3D%3D';

      const credential = await credentials.addFromUrl(url);

      expect(credential.id).toBeDefined();
      expect(credential.content).toStrictEqual(testCredential);
    });

    it('Expect to handle invalid url', async () => {
      const url = 'https://www.google.com';
      const error = await getPromiseError(() => credentials.addFromUrl(url));
      expect(error.message).toBe('Invalid credential');
    });

    it('Expect check if password is required', async () => {
      const url =
        'https://creds-testnet.dock.io/bdab678e5874df158f252584b6d21a139127c3bdcf7f4aff94b25f4ac8bc4044?p=1212121';
      const result = await credentials.isPasswordRequired(url);
      expect(result).toBeTruthy();
    });
    it('Expect check if password is not required', async () => {
      const url =
        'https://creds-testnet.dock.io/bdab678e5874df158f252584b6d21a139127c3bdcf7f4aff94b25f4ac8bc4044';
      const result = await credentials.isPasswordRequired(url);
      expect(result).toBeFalsy();
    });
  });
});
