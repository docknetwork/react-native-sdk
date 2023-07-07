import {createWallet, IWallet} from './wallet';
import {
  accountResolver,
  credentialResolver,
  dockDocumentNetworkResolver,
  resolveApiNetwork,
} from './network-resolver';

describe('Wallet', () => {
  let wallet: IWallet;

  beforeEach(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
      documentNetworkResolver: dockDocumentNetworkResolver,
    });
  });

  it('resolveApiNetwork', () => {
    expect(
      resolveApiNetwork({
        url: 'https://creds-staging.dock.io/proof/0bb39274-4ef1-4e7f-ab8d-d91d8926d9af',
        dataStore: wallet.dataStore,
      }),
    ).toBe('testnet');

    expect(
      resolveApiNetwork({
        url: 'https://creds.dock.io/proof/0bb39274-4ef1-4e7f-ab8d-d91d8926d9af',
        dataStore: wallet.dataStore,
      }),
    ).toBe('mainnet');
  });

  it('expect to add document to mainnet', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    await wallet.addDocument(mockDocument);

    const [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.id).toEqual(mockDocument.id);
  });

  it('expect to add document to testnet', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    wallet.setNetwork('testnet');

    await wallet.addDocument(mockDocument);

    const [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.id).toEqual(mockDocument.id);

    wallet.setNetwork('mainnet');

    const [result2] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result2).toBeUndefined();
  });

  it('expect to allow adding using the same document id in different networks', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    wallet.setNetwork('mainnet');

    await wallet.addDocument(mockDocument);

    let [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.id).toEqual(mockDocument.id);

    wallet.setNetwork('testnet');

    await wallet.addDocument(mockDocument);
  });

  it('expect to filter documents by network', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    wallet.setNetwork('mainnet');

    await wallet.addDocument(mockDocument);

    let [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.id).toEqual(mockDocument.id);

    wallet.setNetwork('testnet');

    [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result).toBeUndefined();
  });

  describe('credentialResolver', () => {
    it('expect to resolve credential to testnet', async () => {
      const result = await credentialResolver({
        document: {
          id: 'https://creds-staging.dock.io/d39b15fe997004db702c9faaf98f9fd619cdf40088549648fb288ea679b53e23?_ga=2.46968743.1402343540.1684360698-1482908456.1677577177',
          type: ['VerifiableCredential'],
        },
        dataStore: wallet.dataStore,
      });

      expect(result).toBe('testnet');
    });
  });

  describe('accountResolver', () => {
    it('expect to resolve account to testnet', async () => {
      const result = await accountResolver({
        document: {
          id: '37PsGbLmrTfV6VVknkrh6LKACXuC9LuSCwuxhk6ajGDjNCwc',
          type: 'Address',
        },
        dataStore: wallet.dataStore,
      });

      expect(result).toBe('testnet');
    });

    it('expect to resolve account to mainnet', async () => {
      const result = await accountResolver({
        document: {
          id: '3EGurYbWGtyVfouDTZjxz1t2jiV3voU9N6sSDAvhHyxaqf8L',
          type: 'Address',
        },
        dataStore: wallet.dataStore,
      });

      expect(result).toBe('mainnet');
    });
  });
});
