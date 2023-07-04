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
      expect(result.data).toStrictEqual(mockDocument);
    });

    it('expect to get document by type', async () => {
      const result = await wallet.getDocumentsByType(mockDocument.type);
      expect(result[0].id).toEqual(mockDocument.id);
      expect(result[0].data).toStrictEqual(mockDocument);
    });

    it('expect to remove a document', async () => {
      await wallet.removeDocument(mockDocument.id);
      const result = await wallet.getDocumentById(mockDocument.id);
      expect(result).toBeNull();
    });
  });
});
