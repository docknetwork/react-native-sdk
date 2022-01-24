import {Wallet} from './wallet';
import walletJson from './wallet-backup.json';

describe('ApiModule', () => {
  let wallet: Wallet;

  beforeAll(async () => {
    wallet = await Wallet.create();
  });

  it('query', async () => {
    const accounts = await wallet.query({
      type: 'account',
    });

    expect(accounts.length).toBe(0);
  });

  it('Expect document to be added', async () => {
    await wallet.add({
      type: 'Account',
      name: 'cocomelon',
    });

    const accounts = await wallet.query({
      type: 'Account',
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

  it('Expect to import wallet from backup file', async () => {
    const password = 'test';

    wallet = await Wallet.create({
      walletId: 'test',
      password,
      json: walletJson,
    });

    const docs = await wallet.query();
    expect(docs.length).toBe(4);

    const addressDoc = docs.find(doc => doc.type === 'Address');

    expect(addressDoc.value).toBe(
      '3AABk8Q165Cj4NpeCZdHH7JGYmDKUg7sZvSiiDD8SpBrABbg',
    );
    expect(addressDoc.name).toBe('test');

    const keypairDoc = docs.find(doc => doc.type === 'KeyringPair');
    expect(keypairDoc.value.encoded).toBe(
      'MFMCAQEwBQYDK2VwBCIEIBA7v8oTxWqoUyV4dcXmxxcunhPWnEaw/W3CKcs2phBX8nxkJ21hUAySYJqVCiy/wcHwFjs7jPbop/vybbW9tM6hIwMhAKBqjm44EQyuODy9HTc61R3oylegEPPGaRyNMlGFO/Fi',
    );

    const mnemonicDoc = docs.find(doc => doc.type === 'Mnemonic');
    expect(mnemonicDoc.value).toBe(
      'tenant jaguar icon flock prosper leave island illegal topple pig axis cactus',
    );
  });

  afterAll(async () => {
    await wallet.close();
  });
});
