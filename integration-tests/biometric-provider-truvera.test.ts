import {
  BiometricsProviderConfigs,
  IDVProvider,
  IDVProviderFactory,
  createBiometricProvider,
  setConfigs
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import { createTruveraIDVProvider, TruveraIDVConfig } from '@docknetwork/wallet-sdk-react-native/lib/truvera-biometric-plugin';
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
    getSupportedBiometryType: jest.fn().mockResolvedValue('FACE_ID'),
    ACCESS_CONTROL: {
      BIOMETRY_ANY: 1,
    },
    ACCESSIBLE: {
      WHEN_UNLOCKED: 1,
    },
    getGenericPassword: jest.fn().mockResolvedValue({ password: '1234567890' }),
    setGenericPassword: jest.fn().mockResolvedValue(true),
  };
});

// Mock UUID to ensure a consistent biometric ID for testing
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-biometric-id-123')
}));

// Mock axios for API calls
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation((url, data) => {
    // Check the credential type from the request data
    const credentialType = data.credential.type[1];
    
    if (credentialType === 'ForSurBiometricEnrollment') {
      return Promise.resolve({
        data: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://schema.truvera.io/biometric-context/v1"
          ],
          "id": "did:dock:enrollment123",
          "type": ["VerifiableCredential", "ForSurBiometricEnrollment"],
          "issuer": data.credential.issuer,
          "issuanceDate": data.credential.issuanceDate,
          "credentialSubject": data.credential.subject,
          "proof": {
            "type": "Ed25519Signature2018",
            "proofValue": "mock-proof-value"
          }
        }
      });
    } else if (credentialType === 'ForSurBiometric') {
      return Promise.resolve({
        data: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://schema.truvera.io/biometric-context/v1"
          ],
          "id": "did:dock:match123",
          "type": ["VerifiableCredential", "ForSurBiometric"],
          "issuer": data.credential.issuer,
          "issuanceDate": data.credential.issuanceDate,
          "expirationDate": data.credential.expirationDate,
          "credentialSubject": data.credential.subject,
          "proof": {
            "type": "BbsBlsSignature2020",
            "proofValue": "mock-proof-value"
          }
        }
      });
    }
    
    return Promise.reject(new Error('Unknown credential type'));
  })
}));

// Configuration for the Truvera provider
const truveraConfig: TruveraIDVConfig = {
  issuerDID: 'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb',
  walletApiUrl: process.env.WALLET_API_URL || '',
  biometricMatchExpirationMinutes: 2,
  ecosystemID: 'clarity-partners-16',
  enrollmentCredentialSchema: 'https://schema.dock.io/ForSurBiometricEnrollment-V4-1709846932138.json',
  biometricMatchCredentialSchema: 'https://schema.dock.io/ForSurBiometricCheck-V4-1709846734949.json',
};

const biometricConfigs: BiometricsProviderConfigs<TruveraIDVConfig> = {
  enrollmentCredentialType: 'ForSurBiometricEnrollment',
  biometricMatchCredentialType: 'ForSurBiometric',
  idvConfigs: truveraConfig,
};

// Create a TruveraIDVProviderFactory that implements IDVProviderFactory
class TruveraIDVProviderFactory implements IDVProviderFactory {
  create(eventEmitter: EventEmitter, wallet: IWallet): IDVProvider {
    return createTruveraIDVProvider({
      wallet,
      eventEmitter,
      configs: truveraConfig,
    });
  }
}

// Mock proof request for biometric verification
const MOCK_PROOF_REQUEST = {
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

describe('Biometric Provider with Truvera Integration', () => {
  let wallet: IWallet;
  let biometricProvider: any;
  let idvProvider: IDVProvider;
  let idvProviderFactory: TruveraIDVProviderFactory;
  let eventEmitter: EventEmitter;

  /**
   * Helper function to simulate the IDV process
   * @param isEnrollment Whether this is an enrollment or matching process
   * @param existingEnrollmentCredential Optional enrollment credential for matching
   * @param proofRequest The proof request to use
   * @returns The result from the IDV provider
   */
  const simulateIDVProcess = async (isEnrollment = true, existingEnrollmentCredential = null, proofRequest = MOCK_PROOF_REQUEST) => {
    // Start the IDV process
    const startIDVPromise = biometricProvider.startIDV(proofRequest);
    
    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate the completion event
    const walletDID = await getDIDProvider().getDefaultDID();
    
    let result;
    if (isEnrollment) {
      result = await idvProvider.enroll(walletDID, proofRequest);
    } else {
      result = await idvProvider.match(walletDID, existingEnrollmentCredential, proofRequest);
    }
    
    biometricProvider.eventEmitter.emit('onComplete', result);
    
    // Wait for startIDV to finish
    await startIDVPromise;
    
    return result;
  };

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
      
      // Use the mock proof request
      const proofRequest = MOCK_PROOF_REQUEST;

      // Create a listener for the onComplete event
      let enrollmentComplete = false;
      let enrollmentCredential;
      let matchCredential;

      biometricProvider.eventEmitter.on('onComplete', (result) => {
        enrollmentComplete = true;
        enrollmentCredential = result.enrollmentCredential;
        matchCredential = result.matchCredential;
      });

      // Simulate the IDV process with enrollment
      const result = await simulateIDVProcess(true, null, proofRequest);
      
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
      expect(storedMatchCredential.credentialSubject.biometric.data).toBeUndefined();
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
        
        const result = await idvProvider.enroll(walletDID, MOCK_PROOF_REQUEST);
        await credentialProvider.addCredential(result.enrollmentCredential);
        enrollmentCredentials = await credentialProvider.getCredentials(biometricConfigs.enrollmentCredentialType);
      }
      
      // Remove any existing match credentials
      const existingMatchCredentials = await credentialProvider.getCredentials(biometricConfigs.biometricMatchCredentialType);
      for (const credential of existingMatchCredentials) {
        await credentialProvider.removeCredential(credential.id);
      }
      
      // Simulate the IDV process with matching using the first enrollment credential
      await simulateIDVProcess(false, enrollmentCredentials[0], MOCK_PROOF_REQUEST);
      
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

      // Use the mock proof request
      const proofRequest = {
        ...MOCK_PROOF_REQUEST,
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