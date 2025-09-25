import {
  ACUMM_WITNESS_PROP_KEY,
  CredentialStatus,
  ICredentialProvider,
  createCredentialProvider,
} from './credential-provider';
import {IWallet, createWallet} from './wallet';

import biometricsBBSRevocation from './fixtures/biometrics-credential-bbs-revocation.json';
import customerCredential from './fixtures/customer-credential.json';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-web/src'
import {blockchainService} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain';

jest.mock('@docknetwork/wallet-sdk-wasm/src/services/blockchain', () => ({
  blockchainService: {
    init: jest.fn().mockResolvedValue(true),
    ensureBlockchainReady: jest.fn().mockResolvedValue(true),
    isApiConnected: jest.fn().mockReturnValue(true),
    isBlockchainReady: true,
  },
}));

describe('CredentialProvider', () => {
  let wallet: IWallet;
  let provider: ICredentialProvider;
  let testId = 0;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(credentialServiceRPC, 'verifyCredential').mockImplementation(async () => {
      return {
        verified: true,
      };
    });

    wallet = await createWallet({
      dataStore: await createDataStore({
        databasePath: `:memory:${testId++}`,
      }),
    });

    provider = createCredentialProvider({wallet});
  });

  afterEach(async () => {
    if (wallet) {
      if (wallet.networkCheckInterval) {
        clearInterval(wallet.networkCheckInterval);
      }

      if (wallet.dataStore && wallet.dataStore.documents) {
        await wallet.dataStore.documents.removeAllDocuments();
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    
    jest.restoreAllMocks();
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
      jest.clearAllMocks();
    });

    it('should create credential status doc with verified status', async () => {
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
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
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

      // Force re-fetch by passing forceFetch option
      const statusDocs = await provider.syncCredentialStatus({forceFetch: true});

      expect(statusDocs.length).toBe(2);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Revoked);
      }
    });

    it('should not call verifyCredential twice for same credential', async () => {
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      // Force initial fetch to ensure clean state
      await provider.syncCredentialStatus({forceFetch: true});
      
      // Verify initial calls
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);
      
      // Clear mock to track only subsequent calls
      jest.clearAllMocks();
      
      // Second call should use cached data
      const statusDocs = await provider.syncCredentialStatus({});
      
      expect(statusDocs.length).toBe(2);
      // Should not call verifyCredential at all since data is already cached
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(0);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
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

      // Force initial fetch to ensure clean state
      await provider.syncCredentialStatus({forceFetch: true});
      
      // Verify initial calls
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      // update statusDoc updateAt to 25 hours ago
      const statusDoc = await wallet.getDocumentById(
        `${customerCredential.id}#status`,
      );
      statusDoc.updatedAt = new Date(
        Date.now() - 25 * 60 * 60 * 1000,
      ).toISOString();
      await wallet.updateDocument(statusDoc);

      // Clear mock to count only the next calls
      jest.clearAllMocks();

      const statusDocs = await provider.syncCredentialStatus({});

      expect(statusDocs.length).toBe(2);

      // Expect only one call for the expired customerCredential
      // The biometricsBBSRevocation should use cached data
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(1);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
      }
    });

    it('should create status only for selected credential', async () => {
      const mockFn = jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      const statusDocs = await provider.syncCredentialStatus({
        credentialIds: [customerCredential.id],
      });

      expect(statusDocs.length).toBe(1);

      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
      }
    });

    it('should return cached status with unable_to_refresh_status warning when verification fails', async () => {
      // First, sync to create initial status documents
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      await provider.syncCredentialStatus({forceFetch: true});

      // Clear mocks
      jest.clearAllMocks();

      // Now simulate a network error during verification
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          throw new Error('Network error: Unable to connect to blockchain');
        });

      // Force fetch to trigger the error scenario
      const statusDocs = await provider.syncCredentialStatus({forceFetch: true});

      expect(statusDocs.length).toBe(2);

      // Check that status documents retain their previous status with warning
      for (const statusDoc of statusDocs) {
        // The status should remain as 'verified' from the cached value
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
        // The warning field should be added
        expect(statusDoc.warning).toBe('unable_to_refresh_status');
      }

      // Verify that verifyCredential was called despite the error
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);
    });

    it('should always refetch credentials with Invalid status even when cached', async () => {
      // First, create credentials with Invalid status
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: false,
            error: 'Credential validation failed',
          };
        });

      await provider.syncCredentialStatus({forceFetch: true});

      // Verify initial calls
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      // Check that status is set to Invalid
      const initialStatusDoc = await wallet.getDocumentById(
        `${customerCredential.id}#status`,
      );
      expect(initialStatusDoc.status).toBe(CredentialStatus.Invalid);

      // Clear mocks to track only subsequent calls
      jest.clearAllMocks();

      // Now mock successful verification
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      // Call syncCredentialStatus again WITHOUT forceFetch
      // Invalid status should trigger refetch even without forceFetch
      const statusDocs = await provider.syncCredentialStatus({});

      // Verify that verifyCredential was called again despite no forceFetch
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      // Check that status is now updated to Verified
      expect(statusDocs.length).toBe(2);
      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
      }
    });

    it('should always refetch credentials with Pending status even when cached', async () => {
      // First, manually create a Pending status document
      const pendingStatusDoc = {
        type: 'CredentialStatus',
        id: `${customerCredential.id}#status`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: CredentialStatus.Pending,
        error: null,
        warning: null,
      };
      await wallet.updateDocument(pendingStatusDoc);

      // Mock successful verification
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      // Call syncCredentialStatus without forceFetch
      // Pending status should trigger refetch
      const statusDocs = await provider.syncCredentialStatus({
        credentialIds: [customerCredential.id],
      });

      // Verify that verifyCredential was called for the Pending credential
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(1);

      // Check that status is now updated to Verified
      expect(statusDocs.length).toBe(1);
      expect(statusDocs[0].status).toBe(CredentialStatus.Verified);
    });

    it('should cache Revoked status and not refetch within 24 hours', async () => {
      // First, create credentials with Revoked status
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: false,
            error: 'Revocation check failed',
          };
        });

      await provider.syncCredentialStatus({forceFetch: true});

      // Verify initial calls
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      // Check that status is set to Revoked
      const revokedStatusDoc = await wallet.getDocumentById(
        `${customerCredential.id}#status`,
      );
      expect(revokedStatusDoc.status).toBe(CredentialStatus.Revoked);

      // Clear mocks to track only subsequent calls
      jest.clearAllMocks();

      // Call syncCredentialStatus again WITHOUT forceFetch
      // Revoked status should NOT trigger refetch within 24 hours
      const statusDocs = await provider.syncCredentialStatus({});

      // Verify that verifyCredential was NOT called (cached)
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(0);

      // Check that status remains Revoked
      expect(statusDocs.length).toBe(2);
      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Revoked);
      }
    });

    it('should cache Verified status and not refetch within 24 hours', async () => {
      // First, create credentials with Verified status
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      await provider.syncCredentialStatus({forceFetch: true});

      // Verify initial calls
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      // Check that status is set to Verified
      const verifiedStatusDoc = await wallet.getDocumentById(
        `${customerCredential.id}#status`,
      );
      expect(verifiedStatusDoc.status).toBe(CredentialStatus.Verified);

      // Clear mocks to track only subsequent calls
      jest.clearAllMocks();

      // Call syncCredentialStatus again WITHOUT forceFetch
      // Verified status should NOT trigger refetch within 24 hours
      const statusDocs = await provider.syncCredentialStatus({});

      // Verify that verifyCredential was NOT called (cached)
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(0);

      // Check that status remains Verified
      expect(statusDocs.length).toBe(2);
      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
      }
    });

    it('should refetch credentials without status document', async () => {
      // Remove any existing status documents
      await wallet.removeDocument(`${customerCredential.id}#status`).catch(() => {});
      await wallet.removeDocument(`${biometricsBBSRevocation.id}#status`).catch(() => {});

      // Mock successful verification
      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: true,
          };
        });

      // Call syncCredentialStatus
      // Missing status docs should trigger fetch
      const statusDocs = await provider.syncCredentialStatus({});

      // Verify that verifyCredential was called for both credentials
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(2);

      // Check that status documents were created
      expect(statusDocs.length).toBe(2);
      for (const statusDoc of statusDocs) {
        expect(statusDoc.status).toBe(CredentialStatus.Verified);
        expect(statusDoc.type).toBe('CredentialStatus');
      }
    });

    afterEach(() => {
      (credentialServiceRPC.verifyCredential as any).mockReset();
    });
  });

  describe('isValid', () => {
    it('should return pending status when SDK is not initialized and no cached status exists', async () => {
      await provider.addCredential({
        ...customerCredential,
      });

      jest
        .spyOn(credentialServiceRPC, 'verifyCredential')
        .mockImplementation(async () => {
          return {
            verified: false,
            error: {
              errors: [
                {
                  message: 'SDK is not initialized'
                }
              ]
            }
          };
        });

      const result = await provider.isValid({credential: customerCredential});
      
      expect(result.status).toBe(CredentialStatus.Pending);
      expect(result.error).toContain('SDK is not initialized. Please ensure the blockchain is connected.');
      expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledTimes(1);
    });
  });
});
