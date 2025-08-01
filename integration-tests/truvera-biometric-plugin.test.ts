import {
  BiometricsProviderConfigs,
  IDVProvider,
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
  getDIDProvider,
  getWallet
} from './helpers/wallet-helpers';

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
const truveraConfig = {
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
}


describe('Truvera Biometric Plugin', () => {
  let truveraProvider: IDVProvider;
  let wallet: IWallet;
  let eventEmitter: EventEmitter;
  let enrollmentCredential: any;

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

    // Initialize Truvera provider
    truveraProvider = createTruveraIDVProvider({
      wallet,
      eventEmitter,
      configs: truveraConfig,
    });
  }, 30000); // Increased timeout for real API calls

  it('should enroll biometrics and create enrollment and match credentials', async () => {
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

    const result = await truveraProvider.enroll(walletDID, proofRequest);

    // Store the enrollment credential for use in the next test
    enrollmentCredential = result.enrollmentCredential;

    // Verify returned credentials
    expect(result).toHaveProperty('enrollmentCredential');
    expect(result).toHaveProperty('matchCredential');
    
    // Check enrollment credential structure
    expect(result.enrollmentCredential.type).toContain('ForSurBiometricEnrollment');
    expect(result.enrollmentCredential.credentialSubject).toBeDefined();
    expect(result.enrollmentCredential.credentialSubject.biometric).toBeDefined();
    expect(result.enrollmentCredential.credentialSubject.biometric.id).toBe('test-biometric-id-123');
    expect(result.enrollmentCredential.credentialSubject.biometric.created).toBeDefined();
    
    // Check match credential structure
    expect(result.matchCredential.type).toContain('ForSurBiometric');
    expect(result.matchCredential.credentialSubject).toBeDefined();
    expect(result.matchCredential.credentialSubject.biometric).toBeDefined();
    expect(result.matchCredential.credentialSubject.biometric.id).toBe('test-biometric-id-123');
    expect(result.matchCredential.credentialSubject.biometric.data).toBeUndefined();
    expect(result.matchCredential.expirationDate).toBeDefined();
  }, 30000); // Increased timeout for real API calls

  it('should match biometrics and create match credential', async () => {
    // Skip this test if no enrollment credential is available
    if (!enrollmentCredential) {
      console.warn("Skipping match test because enrollment credential is not available");
      return;
    }

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

    const result = await truveraProvider.match(
      walletDID, 
      enrollmentCredential, 
      proofRequest
    );
  
    // Verify returned credential
    expect(result).toHaveProperty('matchCredential');
    expect(result.matchCredential.type).toContain('ForSurBiometric');
    expect(result.matchCredential.credentialSubject.biometric.data).toBeUndefined();
    expect(result.matchCredential.credentialSubject.biometric.id).toBe('test-biometric-id-123');
    expect(result.matchCredential.expirationDate).toBeDefined();
  }, 30000); // Increased timeout for real API calls

  it('should handle errors when biometric check fails', async () => {
    // Override the mock for this test
    (require('react-native-keychain').getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Biometric check failed')
    );

    const walletDID = await getDIDProvider().getDefaultDID();
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

    // Expect the enroll function to throw an error
    await expect(truveraProvider.enroll(walletDID, proofRequest)).rejects.toThrow('Biometric check failed');
  });

  afterAll(() => closeWallet());
});