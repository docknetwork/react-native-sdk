import {Wallet} from './wallet';

// TODO: Test events

describe('ApiModule', () => {
  let wallet = Wallet.getInstance();

  beforeAll(async () => {
    await wallet.load();
  });

  it('query', async () => {
    const accounts = await wallet.query({
      type: 'account',
    });

    expect(accounts.length).toBe(0);
  });

  it('Expect document to be added', async () => {
    await wallet.add({
      type: 'account',
      name: 'cocomelon',
    });

    const accounts = await wallet.query({
      type: 'account',
    });

    expect(accounts.length).toBe(1);
  });

  it('Expect document to be removed', async () => {
    const document = await wallet.add({
      type: 'account',
      name: 'cocomelon',
    });

    await wallet.remove(document.id);

    const doc = await wallet.getDocumentById(document.id);

    expect(doc).toBeUndefined();
  });

  afterAll(async () => {
    await wallet.close();
  });
});
