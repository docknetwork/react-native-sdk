import {
  cleanup,
  closeWallet,
  createAccounts,
  createNewWallet,
  getDocumentsByType,
  setNetwork,
  setupEnvironent,
} from './helpers';
import {BasicCredential} from './data/credentials';
import {importCredentialJSON} from './helpers/credential-helpers';

async function createWalletData() {
  await createAccounts();
  await importCredentialJSON(BasicCredential);
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
    await setupEnvironent();
    await createNewWallet();
  });

  // it('expect to filter mainnet documents from testnet documents', async () => {
  //   await setNetwork('mainnet');
  //   await createWalletData();
  //   await assertWalletData();
  //   await setNetwork('testnet');
  //   const isEmpty = await isWalletEmpty();
  //   expect(isEmpty).toBe(true);
  // });

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
