import {
  BiometricsProviderConfigs,
  IDVProvider,
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
  getDIDProvider,
  getWallet
} from './helpers/wallet-helpers';

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
const truveraConfig = {
  issuerDID: 'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb',
  idvApiURL: process.env.IDV_API_URL || '',
  biometricMatchExpirationMinutes: 2,
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
    truveraProvider = createTruveraIDVProviderFactory({
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
    expect(result.matchCredential.credentialSubject.biometric.data).toBe('hidden');
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
    expect(result.matchCredential.credentialSubject.biometric.data).toBe('hidden');
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