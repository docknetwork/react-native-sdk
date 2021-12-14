import {Wallet, WalletDocument} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';

const mockDocuments: WalletDocument[] = [];


describe('Wallet integration test', () => {
  let wallet = Wallet.getInstance();

  beforeAll(async() => {
      await wallet.load();
      await Promise.all(mockDocuments.map(doc => wallet.add(doc)));
  });

  it('Expect to get all documents', async () => {
    const documents = await wallet.query();
    // expect(documents.length).toBe(mockDocuments.length);
  });

  it('Expect to add new account', async () => {
    const documents = await wallet.query();
    // expect(documents.length).toBe(mockDocuments.length);
  });

  it('Expect to export account backup', async () => {
    const documents = await wallet.query();
    // expect(documents.length).toBe(mockDocuments.length);
  });

  it('Expect to import account from backup file', async () => {
    const documents = await wallet.query();
    // expect(documents.length).toBe(mockDocuments.length);
  });

  it('Expect to import account from backup file', async () => {
    const documents = await wallet.query();
    // expect(documents.length).toBe(mockDocuments.length);
  });

  // it('Expect to get accounts', async () => {
  //   const documents = await wallet.getDocuments();
  //   expect(documents.length).toBe(mockDocuments.length);
  // });
});
