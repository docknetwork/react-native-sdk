import {createDIDProvider} from './did-provider';
import {createWallet, ensureDocumentContext, IWallet} from './wallet';

describe('Wallet', () => {
  let wallet: IWallet;

  beforeEach(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
    });
  });

  it('expect to create a wallet', async () => {
    expect(wallet).toBeDefined();
    expect(wallet.dataStore).toBeDefined();
  });

  it('expect to add missing @context on documents', () => {
    const documents = [
      {
        id: 1,
      },
      {
        id: 2,
        '@context': 'test',
      },
    ];

    const result = documents.map(ensureDocumentContext);

    expect(result[0]['@context']).toStrictEqual(['https://w3id.org/wallet/v1']);
    expect(result[1]['@context']).toEqual('test');
  });

  it('expect to create default dids', async () => {
    const dids = await createDIDProvider({wallet}).getAll();
    expect(dids.length).toBe(1);
    await wallet.setNetwork('testnet');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const dids2 = await createDIDProvider({wallet}).getAll();
    expect(dids2.length).toBe(1);
  });

  describe('document CRUD', () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    beforeEach(async () => {
      await wallet.addDocument(mockDocument);
    });

    it('expect to get a document by id', async () => {
      const result = await wallet.getDocumentById(mockDocument.id);
      expect(result.id).toEqual(mockDocument.id);
      expect(result).toStrictEqual(mockDocument);
    });

    it('expect to get document by type', async () => {
      const result = await wallet.getDocumentsByType(mockDocument.type);
      expect(result[0]).toStrictEqual(mockDocument);
    });

    it('expect to remove a document', async () => {
      await wallet.removeDocument(mockDocument.id);
      const result = await wallet.getDocumentById(mockDocument.id);
      expect(result).toBeNull();
    });
  });
});
