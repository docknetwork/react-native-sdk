import {
  BiometricsProviderConfigs,
  IDVProvider,
  IDVProviderFactory,
  createBiometricProvider,
  setConfigs
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import { createTruveraIDVProviderFactory, TruveraIDVConfig } from '@docknetwork/wallet-sdk-react-native/lib/truvera-biometric-plugin';
import { EventEmitter } from 'stream';
import { IWallet } from '@docknetwork/wallet-sdk-core/src/types';
import {
  setDIDProvider,
  setWallet,
} from '@docknetwork/wallet-sdk-react-native/lib/wallet';
import {
  closeWallet,
  getCredentialProvider,
  getDIDProvider,
  getWallet
} from './helpers/wallet-helpers';
import { v4 as uuid } from 'uuid';

// Only mock Keychain for biometric checks
jest.mock('react-native-keychain', () => {
  return {
    getSupportedBiometryType: () => 'FACE_ID',
    ACCESS_CONTROL: {
      BIOMETRY_ANY: 1,
    },
    ACCESSIBLE: {
      WHEN_UNLOCKED: 1,
    },
    getGenericPassword: jest.fn().mockResolvedValue('data'),
  };
});

// Mock UUID to ensure a consistent biometric ID for testing
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-biometric-id-123')
}));

// Configuration for the Truvera provider
const truveraConfig: TruveraIDVConfig = {
  issuerDID: 'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb',
  walletApiUrl: process.env.WALLET_API_URL || '',
  biometricMatchExpirationMinutes: 2,
};

const biometricConfigs: BiometricsProviderConfigs<TruveraIDVConfig> = {
  enrollmentCredentialType: 'ForSurBiometricEnrollment',
  biometricMatchCredentialType: 'ForSurBiometric',
  idvConfigs: truveraConfig,
};

// Create a TruveraIDVProviderFactory that implements IDVProviderFactory
class TruveraIDVProviderFactory implements IDVProviderFactory {
  create(eventEmitter: EventEmitter, wallet: IWallet): IDVProvider {
    return createTruveraIDVProviderFactory({
      wallet,
      eventEmitter,
      configs: truveraConfig,
    });
  }
}

describe('Biometric Provider with Truvera Integration', () => {
  let wallet: IWallet;
  let biometricProvider: any;
  let idvProvider: IDVProvider;
  let idvProviderFactory: TruveraIDVProviderFactory;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup biometric configs
    setConfigs(biometricConfigs);
  });

  beforeAll(async () => {
    wallet = await getWallet();
    eventEmitter = new EventEmitter();

    // Set react-native context
    setDIDProvider(getDIDProvider());
    setWallet(wallet as any);

    // Create the IDV provider factory and provider
    idvProviderFactory = new TruveraIDVProviderFactory();
    
    // For testing individual IDV provider functions
    idvProvider = idvProviderFactory.create(eventEmitter, wallet);

    // Create the biometric provider
    biometricProvider = createBiometricProvider({
      wallet,
      idvProviderFactory,
    });
  }, 30000); // Increased timeout for real API calls

  describe('Enrollment process', () => {
    it('should create enrollment and match credentials when no enrollment credential exists', async () => {
      // Clear any existing credentials first
      const credentialProvider = getCredentialProvider();
      const existingCredentials = await credentialProvider.getCredentials(biometricConfigs.enrollmentCredentialType);
      for (const credential of existingCredentials) {
        await credentialProvider.removeCredential(credential.id);
      }
      
      const proofRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  path: ['$.credentialSubject.biometric.id'],
                },
                {
                  path: ['$.credentialSubject.biometric.created'],
                },
              ],
            },
          },
        ],
      };

      // Create a listener for the onComplete event
      let enrollmentComplete = false;
      let enrollmentCredential;
      let matchCredential;

      biometricProvider.eventEmitter.on('onComplete', (result) => {
        enrollmentComplete = true;
        enrollmentCredential = result.enrollmentCredential;
        matchCredential = result.matchCredential;
      });

      // Start the IDV process - In real scenario this would wait for user interaction
      // For our test, we need to simulate the user completing the IDV process
      const startIDVPromise = biometricProvider.startIDV(proofRequest);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate the completion event ourselves (in real app, the wallet would do this)
      const walletDID = await getDIDProvider().getDefaultDID();
      const result = await idvProvider.enroll(walletDID, proofRequest);
      biometricProvider.eventEmitter.emit('onComplete', result);
      
      // Wait for startIDV to finish
      await startIDVPromise;
      
      // Check that the credentials were added to the credential store
      const enrollmentCredentials = await credentialProvider.getCredentials(biometricConfigs.enrollmentCredentialType);
      const matchCredentials = await credentialProvider.getCredentials(biometricConfigs.biometricMatchCredentialType);
      
      expect(enrollmentCredentials.length).toBe(1);
      expect(matchCredentials.length).toBe(1);
      
      // Verify credential structures
      const storedEnrollmentCredential = enrollmentCredentials[0];
      expect(storedEnrollmentCredential.type).toContain(biometricConfigs.enrollmentCredentialType);
      expect(storedEnrollmentCredential.credentialSubject.biometric).toBeDefined();
      expect(storedEnrollmentCredential.credentialSubject.biometric.id).toBe('test-biometric-id-123');
      
      const storedMatchCredential = matchCredentials[0];
      expect(storedMatchCredential.type).toContain(biometricConfigs.biometricMatchCredentialType);
      expect(storedMatchCredential.credentialSubject.biometric.data).toBe('hidden');
    }, 30000);
  });

  describe('Matching process', () => {
    it('should create only match credential when enrollment credential exists', async () => {
      // Ensure there's an enrollment credential
      const credentialProvider = getCredentialProvider();
      let enrollmentCredentials = await credentialProvider.getCredentials(biometricConfigs.enrollmentCredentialType);
      
      // If there's no enrollment credential, create one first
      if (enrollmentCredentials.length === 0) {
        const walletDID = await getDIDProvider().getDefaultDID();
        const proofRequest = {
          input_descriptors: [
            {
              constraints: {
                fields: [
                  {
                    path: ['$.credentialSubject.biometric.id'],
                  },
                  {
                    path: ['$.credentialSubject.biometric.created'],
                  },
                ],
              },
            },
          ],
        };
        
        const result = await idvProvider.enroll(walletDID, proofRequest);
        await credentialProvider.addCredential(result.enrollmentCredential);
        enrollmentCredentials = await credentialProvider.getCredentials(biometricConfigs.enrollmentCredentialType);
      }
      
      // Remove any existing match credentials
      const existingMatchCredentials = await credentialProvider.getCredentials(biometricConfigs.biometricMatchCredentialType);
      for (const credential of existingMatchCredentials) {
        await credentialProvider.removeCredential(credential.id);
      }
      
      const proofRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  path: ['$.credentialSubject.biometric.id'],
                },
                {
                  path: ['$.credentialSubject.biometric.created'],
                },
              ],
            },
          },
        ],
      };
      
      // Start the IDV process
      const startIDVPromise = biometricProvider.startIDV(proofRequest);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate the completion event ourselves (in real app, the wallet would do this)
      const walletDID = await getDIDProvider().getDefaultDID();
      const result = await idvProvider.match(walletDID, enrollmentCredentials[0], proofRequest);
      biometricProvider.eventEmitter.emit('onComplete', result);
      
      // Wait for startIDV to finish
      await startIDVPromise;
      
      // Check that a new match credential was added
      const matchCredentials = await credentialProvider.getCredentials(biometricConfigs.biometricMatchCredentialType);
      expect(matchCredentials.length).toBe(1);
      
      // Verify match credential structure
      const storedMatchCredential = matchCredentials[0];
      expect(storedMatchCredential.type).toContain(biometricConfigs.biometricMatchCredentialType);
      expect(storedMatchCredential.expirationDate).toBeDefined();
    }, 30000);
  });

  describe('Error handling', () => {
    it('should handle biometric check errors', async () => {
      // Override the mock for this test
      (require('react-native-keychain').getGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Biometric check failed')
      );

      const proofRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  path: ['$.credentialSubject.biometric.id'],
                },
              ],
            },
          },
        ],
      };

      // Expect the startIDV process to throw an error
      await expect(biometricProvider.startIDV(proofRequest)).rejects.toThrow();
    });
  });

  afterAll(async () => {
    // Clean up any test credentials
    const credentialProvider = getCredentialProvider();
    
    // Clean up enrollment credentials
    const enrollmentCredentials = await credentialProvider.getCredentials(biometricConfigs.enrollmentCredentialType);
    for (const credential of enrollmentCredentials) {
      await credentialProvider.removeCredential(credential.id);
    }
    
    // Clean up match credentials
    const matchCredentials = await credentialProvider.getCredentials(biometricConfigs.biometricMatchCredentialType);
    for (const credential of matchCredentials) {
      await credentialProvider.removeCredential(credential.id);
    }
    
    await closeWallet();
  });
});