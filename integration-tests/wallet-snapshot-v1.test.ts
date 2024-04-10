/**
 * Wallet data store v1 uses localStorage to store data
 * This integration test injects into the localStorage a test snapshot of its state
 * And ensure the wallet-sdk can load the data and perform operations
 * Also useful to perform data migration tests
 */

import {
  assertAccountIsValid,
  cleanup,
  createWalletFromSnapshot,
  getAccounts,
  getWallet,
  setupEnvironent,
} from './helpers';
import {getCredentials} from './helpers/credential-helpers';
import {getDIDResolutions, getDIDKeyPairs} from './helpers/did-helpers';
import {getVerificationTemplates} from './helpers/verification-helpers';

describe('Wallet Snapshot V1', () => {
  let wallet;
  beforeAll(async () => {
    await cleanup();
    await setupEnvironent();
    await createWalletFromSnapshot();
    wallet = await getWallet();
  });

  it('expect to have load all documents', async () => {
    const documents = await wallet.query({});
    expect(documents.length).toBe(9);
  });

  it('expect to have load accounts', async () => {
    const accounts = await getAccounts();
    expect(accounts.length).toBe(1);

    const [account] = accounts;

    expect(account.id).toBe('37NKEP14n9omsAgxJ3sn14XtHo2vs5a34UcpCyybXQJoUQ92');

    await assertAccountIsValid(account.id);
  });

  it('expect to have loaded DIDs', async () => {
    const didKeyPairs = await getDIDKeyPairs();
    expect(didKeyPairs.length).toBe(1);
    const didResolutions = await getDIDResolutions();
    expect(didResolutions.length).toBe(1);
  });

  it('expect to have loaded credentials', async () => {
    const credentials = await getCredentials();
    expect(credentials.length).toBe(1);

    const credential = credentials[0];
    expect(credential.type).toEqual([
      'VerifiableCredential',
      'BasicCredential',
      'PrettyVerifiableCredential',
    ]);
    expect(credential.id).toEqual(
      'https://***REMOVED***/cca99aae610dc3e0c2c6c60ac9a1866211022499d36cf1c72bb7889316ee6fd0',
    );
  });

  it('expect to have loaded Verification Templates', async () => {
    const templates = await getVerificationTemplates();
    expect(templates.length).toBe(1);
  });
});
