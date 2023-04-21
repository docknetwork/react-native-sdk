import {
  cleanup,
  createAccounts,
  createNewWallet,
  getAllDocuments,
  getWallet,
  importAccountFromMnemonic,
  importAccountJSON,
  setupEnvironent,
} from './helpers';
import {Account2MnemonicDetails, AccountJSON} from './data/accounts';

describe('Accounts', () => {
  beforeAll(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
    await createAccounts();
  });

  it('expect to have created accounts', async () => {
    // await wallet.accounts.load();
    const documents = await getAllDocuments();
    const addressList = documents.filter(doc => doc.type === 'Address');
    expect(addressList.length).toBe(2);
  });

  it('expect to have valid KeyringPair on each account', async () => {
    const documents = await getAllDocuments();
    const addressList = documents.filter(doc => doc.type === 'Address');

    for (const document of addressList) {
      const correlations = await getWallet().resolveCorrelations(
        document.address,
      );

      const keyringPair = correlations.find(doc => doc.type === 'KeyringPair');
      expect(keyringPair).toBeDefined();
    }
  });

  it('expect to import account from mnemonic', async () => {
    let account = await getWallet().getDocumentById(
      Account2MnemonicDetails.address,
    );
    expect(account).toBeUndefined();

    await importAccountFromMnemonic();
    account = await getWallet().getDocumentById(
      Account2MnemonicDetails.address,
    );

    expect(account.id).toBe(Account2MnemonicDetails.address);
  });

  it('expect to import account from JSON', async () => {
    let account = await getWallet().getDocumentById(AccountJSON.address);
    expect(account).toBeUndefined();

    await importAccountJSON();
    account = await getWallet().getDocumentById(AccountJSON.address);

    console.log(account);

    expect(account.id).toBe(AccountJSON.address);
  });
});
