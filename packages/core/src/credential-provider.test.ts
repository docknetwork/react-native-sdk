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
