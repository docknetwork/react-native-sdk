import {
  cleanup,
  closeWallet,
  createNewWallet,
  getCredentialProvider,
  getDocumentsByType,
  setNetwork,
} from './helpers';
import {BasicCredential} from './data/credentials';

async function createWalletData() {
  await getCredentialProvider().addCredential(BasicCredential);
}

async function assertWalletData() {
  const accounts = await getDocumentsByType('Address');
  const credentials = await getDocumentsByType('VerifiableCredential');

  expect(accounts.length).toBe(2);
  expect(credentials.length).toBe(1);
}

async function isWalletEmpty() {
  const accounts = await getDocumentsByType('Address');
  const credentials = await getDocumentsByType('VerifiableCredential');

  return !(accounts.length && credentials.length);
}

describe('Switch wallet', () => {
  beforeEach(async () => {
    await cleanup();
    await createNewWallet();
  });


  it('expect switch to tesnet and have an empty wallet', async () => {
    await setNetwork('testnet');
    await createWalletData();
    await assertWalletData();
    await setNetwork('mainnet');
    const err = await assertWalletData().catch(err => err);
    expect(err).toBeDefined();
  });

  it('expect switch to tesnet and have an empty wallet', () => {});

  afterAll(() => closeWallet());
});
