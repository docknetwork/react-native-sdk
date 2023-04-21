import {
  getCredentialById,
  importCredentialJSON,
} from './helpers/credential-helpers';
import {
  BasicCredential,
  PolygonIDCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
} from './data/credentials';
import {cleanup, createNewWallet, setupEnvironent} from './helpers';

const allCredentials = [
  BasicCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
  PolygonIDCredential,
];

describe('Credentials', () => {
  beforeEach(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
  });

  it('expect to import credentials', async () => {
    for (const credentialJSON of allCredentials) {
      await importCredentialJSON(credentialJSON);
      const credential = await getCredentialById(credentialJSON.id);
      expect(credential).toBeDefined();
    }
  });

  describe('credential status', () => {
    it('expect to have "Valid" status', () => {});

    it('expect to have "Invalid" status', () => {});

    it('expect to have "Checking..." status when verification is in progress', () => {});
  });
});
