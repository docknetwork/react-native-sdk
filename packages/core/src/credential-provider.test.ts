import {
  ACUMM_WITNESS_PROP_KEY,
  CREDENTIAL_STATUS,
  ICredentialProvider,
  createCredentialProvider,
} from './credential-provider';
import {IWallet, createWallet} from './wallet';

import biometricsBBSRevocation from './fixtures/biometrics-credential-bbs-revocation.json';
import customerCredential from './fixtures/customer-credential.json';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';

describe('CredentialProvider', () => {
  let wallet: IWallet;
  let provider: ICredentialProvider;

  beforeEach(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
    });

    provider = createCredentialProvider({wallet});
  });

  describe('addCredential', () => {
    it('should add a credential to the wallet', async () => {
      await provider.addCredential({
        ...biometricsBBSRevocation,
      });

      const cred = await provider.getById(biometricsBBSRevocation.id);

      expect(cred.id).toBe(biometricsBBSRevocation.id);

      const witness = await provider.getMembershipWitness(cred.id);

      expect(witness).toBe(biometricsBBSRevocation[ACUMM_WITNESS_PROP_KEY]);
    });
  });

  describe('syncCredentialStatus', () => {
    beforeEach(async () => {
      await provider.addCredential({
        ...customerCredential,
      });
      await provider.addCredential({
        ...biometricsBBSRevocation,
      });
    });

    it('should create credential status doc with for all credentials', async () => {
      const mockFn = jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      const statusDocs = await provider.syncCredentialStatus({});

      expect(statusDocs.length).toBe(2);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CREDENTIAL_STATUS.Verified);
      }
    });

    it('should create credential status doc with revoked status', async () => {
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: false,
            error: 'Revocation check failed',
          };
        });

      const statusDocs = await provider.syncCredentialStatus({});

      expect(statusDocs.length).toBe(2);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CREDENTIAL_STATUS.Revoked);
      }
    });

    it('should not call verifyCredential twice', async () => {
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      // first call will do actual fetch
      await provider.syncCredentialStatus({});
      // additional calls will use cached data
      const statusDocs = await provider.syncCredentialStatus({});

      expect(statusDocs.length).toBe(2);
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CREDENTIAL_STATUS.Verified);
      }
    });

    it('should update cache after 24 hours', async () => {
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      // load data into cache
      await provider.syncCredentialStatus({});
      
      // update statusDoc updateAt to 25 hours ago
      const statusDoc = await wallet.getDocumentById(`${customerCredential.id}#status`);
      statusDoc.updatedAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      await wallet.updateDocument(statusDoc);

      const statusDocs = await provider.syncCredentialStatus({});

      expect(statusDocs.length).toBe(2);

      // Expect to have a second status fetch for the customerCredential
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(3);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CREDENTIAL_STATUS.Verified);
      }
    });

    afterEach(() => {
      (credentialServiceRPC.verifyCredential as any).mockReset();
    });
  });
});
