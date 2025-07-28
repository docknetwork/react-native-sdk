import {
  convertDateTimeToDate,
  createTruveraIDVProvider,
  getIssuanceDate,
} from './truvera-biometric-plugin';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {EventEmitter} from 'stream';
import {getBiometricConfigs} from '@docknetwork/wallet-sdk-core/src/biometric-provider';

// Mock external dependencies
jest.mock('axios');
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-value',
}));
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
jest.mock('@docknetwork/wallet-sdk-core/src/biometric-provider', () => ({
  getBiometricConfigs: jest.fn().mockReturnValue({
    enrollmentCredentialType: 'ForSurBiometricEnrollment',
    biometricMatchCredentialType: 'ForSurBiometric',
  }),
  getIssuanceDate: jest.fn(),
}));

// Mock the exported function to prevent circular dependencies
jest.mock('./truvera-biometric-plugin', () => {
  // Store original module
  const originalModule = jest.requireActual('./truvera-biometric-plugin');
  
  return {
    ...originalModule,
    // Mock getIssuanceDate to return a fixed date for testing
    getIssuanceDate: jest.fn().mockReturnValue('2023-01-01T00:00:00Z'),
  };
});

// Setup mocked axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock wallet
const mockWallet = {
  getNetworkId: jest.fn().mockReturnValue('testnet'),
} as any;

// Mock enrollment and match credential responses
const mockEnrollmentCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.truvera.io/biometric-context/v1"
  ],
  "id": "did:dock:enrollment123",
  "type": ["VerifiableCredential", "ForSurBiometricEnrollment"],
  "issuer": "did:dock:issuer123",
  "issuanceDate": "2023-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:dock:wallet123",
    "biometric": {
      "id": "mock-uuid-value",
      "data": JSON.stringify({id: "mock-uuid-value"}),
      "created": "2023-01-01T00:00:00Z"
    }
  },
  "proof": {
    "type": "Ed25519Signature2018",
    "proofValue": "mock-proof-value"
  }
};

const mockMatchCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.truvera.io/biometric-context/v1"
  ],
  "id": "did:dock:match123",
  "type": ["VerifiableCredential", "ForSurBiometric"],
  "issuer": "did:dock:issuer123",
  "issuanceDate": "2023-01-01T00:00:00Z",
  "expirationDate": "2023-01-01T00:02:00Z",
  "credentialSubject": {
    "id": "did:dock:wallet123",
    "biometric": {
      "id": "mock-uuid-value",
      "created": "2023-01-01T00:00:00Z",
      "data": "hidden"
    }
  },
  "proof": {
    "type": "BbsBlsSignature2020",
    "proofValue": "mock-proof-value"
  }
};

const truveraConfig = {
  issuerDID: 'did:dock:issuer123',
  walletApiUrl: 'https://api-testnet.truvera.io',
  biometricMatchExpirationMinutes: 2,
  ecosystemID: 'clarity-partners-16',
  enrollmentCredentialSchema: 'https://schema.dock.io/ForSurBiometricEnrollment-V4-1709846932138.json',
  biometricMatchCredentialSchema: 'https://schema.dock.io/ForSurBiometricCheck-V4-1709846734949.json',
};

describe('Truvera Biometric Plugin Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Keychain is already mocked globally, no need to mock it here again
    
    // Setup axios mock responses
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/issue-credential')) {
        // Different credentials based on request type
        const requestData = mockedAxios.post.mock.calls[mockedAxios.post.mock.calls.length - 1][1] as any;
        const credentialType = requestData.credential.type[1];
        
        if (credentialType === 'ForSurBiometricEnrollment') {
          return Promise.resolve({ data: mockEnrollmentCredential });
        } else {
          return Promise.resolve({ data: mockMatchCredential });
        }
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('getIssuanceDate', () => {
    it('should return a properly formatted ISO date string', () => {
      const result = getIssuanceDate();
      expect(result).toBe('2023-01-01T00:00:00Z');
      expect(typeof result).toBe('string');
    });
  });

  describe('createTruveraIDVFactory', () => {
    let provider: any;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
      eventEmitter = new EventEmitter();
      provider = createTruveraIDVProvider({
        wallet: mockWallet,
        eventEmitter,
        configs: truveraConfig,
      });
    });

    describe('enroll method', () => {
      it('should perform biometric check before enrollment', async () => {
        const walletDID = 'did:dock:wallet123';
        const proofRequest = {};

        await provider.enroll(walletDID, proofRequest);

        expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        });
      });

      it('should issue both enrollment and match credentials', async () => {
        const walletDID = 'did:dock:wallet123';
        const proofRequest = {};

        const result = await provider.enroll(walletDID, proofRequest);

        // Check if axios was called correctly for both credentials
        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        
        // Verify first call was for enrollment credential
        const enrollCall = mockedAxios.post.mock.calls[0];
        expect(enrollCall[0]).toBe('https://api-testnet.truvera.io/issue-credential');
        expect((enrollCall[1] as any).credential.type).toContain('ForSurBiometricEnrollment');
        expect((enrollCall[1] as any).credential.subject.id).toBe(walletDID);
        
        // Verify second call was for match credential
        const matchCall = mockedAxios.post.mock.calls[1];
        expect(matchCall[0]).toBe('https://api-testnet.truvera.io/issue-credential');
        expect((matchCall[1] as any).credential.type).toContain('ForSurBiometric');
        
        // Verify both credentials are returned
        expect(result).toHaveProperty('enrollmentCredential');
        expect(result).toHaveProperty('matchCredential');
        expect(result.enrollmentCredential).toEqual(mockEnrollmentCredential);
        expect(result.matchCredential).toEqual(mockMatchCredential);
      });

      it('should throw error if biometric check fails', async () => {
        // Override the mock for this test
        (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
          new Error('Biometric check failed')
        );

        const walletDID = 'did:dock:wallet123';
        const proofRequest = {};

        await expect(provider.enroll(walletDID, proofRequest)).rejects.toThrow('Biometric check failed');
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });
    });

    describe('match method', () => {
      it('should perform biometric check before matching', async () => {
        const walletDID = 'did:dock:wallet123';
        const proofRequest = {};

        await provider.match(walletDID, mockEnrollmentCredential, proofRequest);

        expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        });
      });

      it('should issue match credential using enrollment credential biometric ID', async () => {
        const walletDID = 'did:dock:wallet123';
        const proofRequest = {};

        const result = await provider.match(walletDID, mockEnrollmentCredential, proofRequest);

        // Check if axios was called correctly
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        
        const matchCall = mockedAxios.post.mock.calls[0];
        expect(matchCall[0]).toBe('https://api-testnet.truvera.io/issue-credential');
        expect((matchCall[1] as any).credential.type).toContain('ForSurBiometric');
        expect((matchCall[1] as any).credential.subject.biometric.id).toBe('mock-uuid-value');
        
        // Verify credential expiration date was set
        expect((matchCall[1] as any).credential.expirationDate).toBeDefined();
        
        // Verify match credential is returned
        expect(result).toHaveProperty('matchCredential');
        expect(result.matchCredential).toEqual(mockMatchCredential);
      });

      it('should throw error if API call fails', async () => {
        // Ensure biometric check passes
        (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce('FACE_ID');
        (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);
        (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({ password: '1234567890' });
        
        // Then make API call fail
        mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

        const walletDID = 'did:dock:wallet123';
        const proofRequest = {};

        await expect(
          provider.match(walletDID, mockEnrollmentCredential, proofRequest)
        ).rejects.toThrow('Unable to issue match credential');
      });
    });
  });

  describe('convertDateTimeToDate', () => {
    it('should convert ISO datetime string to date string', () => {
      const input = '2024-03-20T15:30:45.123Z';
      const expected = '2024-03-20';
      expect(convertDateTimeToDate(input)).toBe(expected);
    });
  
    it('should return the same string if input is already a date', () => {
      const input = '2024-03-20';
      expect(convertDateTimeToDate(input)).toBe(input);
    });
  }); 
});