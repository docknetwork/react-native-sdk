import {Credentials} from './index';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import testCredential from '../fixtures/test-credential.json';
import {
  ensureDockAPIConnected,
  getPromiseError,
} from '@docknetwork/wallet-sdk-core/lib/services/test-utils';
import {didDockDocument, didKeyDocument} from '../fixtures/dids';

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
  });

  describe('web3 id auth', () => {
    const credentials = Credentials.getInstance();
    const web3IDURLExample =
      'dockwallet://didauth?url=https%3A%2F%2Fauth.dock.io%2Fverify%3Fid%3DiW3Xe9Vl6ea8039da347b47a09654e3d44278e26aa08b08c7ff07211f70ba491ce39b643%26scope%3Dpublic%20email%26client_name%3DDock%2520Certs%26client_website%3Dhttps%253A%252F%252Fcerts.dock.io';
    const profileData = {
      name: 'test',
      email: 'test@tester.com',
    };

    beforeAll(async () => {
      await ensureDockAPIConnected();
    });

    it('getWeb3IDReturnURL', () => {
      expect(
        credentials.getWeb3IDReturnURL(
          'dockwallet://didauth?url=someReturnURL',
        ),
      ).toBe('someReturnURL');
    });

    it('expect to handle did:key auth', async () => {
      const vc = await credentials.getWeb3IDVC({
        url: web3IDURLExample,
        keyDoc: didKeyDocument,
        profile: profileData,
      });

      const verification = await credentials.verifyCredential({credential: vc});
      expect(verification.verified).toBe(true);
    });

    it('expect to handle did:dock auth', async () => {
      const vc = await credentials.getWeb3IDVC({
        url: web3IDURLExample,
        keyDoc: didDockDocument,
        profile: profileData,
      });

      const verification = await credentials.verifyCredential({credential: vc});

      if (!verification.verified) {
        console.log(verification.error);
      }

      expect(verification.verified).toBe(true);
    });
  });
});
