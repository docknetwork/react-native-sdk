import {
  createTrustXIDVProvider,
  TrustXIDVConfig,
} from './trustx-biometric-plugin';
import { IDV_EVENTS, IDVProvider } from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { EventEmitter } from 'stream';

// Mock external dependencies
jest.mock('axios');
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

// Setup mocked axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock wallet
const mockWallet = {
  getNetworkId: jest.fn().mockReturnValue('testnet'),
} as any;

// Sample credentials for testing
const mockEnrollmentCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.truvera.io/biometric-context/v1"
  ],
  "id": "did:dock:enrollment123",
  "type": ["VerifiableCredential", "BiometricEnrollment"],
  "issuer": "did:dock:issuer123",
  "issuanceDate": "2023-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:dock:wallet123",
    "biometric_enrollment_id": "enrollment-123",
    "created": "2023-01-01T00:00:00Z"
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
  "type": ["VerifiableCredential", "BiometricMatch"],
  "issuer": "did:dock:issuer123",
  "issuanceDate": "2023-01-01T00:00:00Z",
  "expirationDate": "2023-01-01T00:02:00Z",
  "credentialSubject": {
    "id": "did:dock:wallet123",
    "biometric_match_id": "match-123",
    "biometric_enrollment_id": "enrollment-123",
    "created": "2023-01-01T00:00:00Z"
  },
  "proof": {
    "type": "BbsBlsSignature2020",
    "proofValue": "mock-proof-value"
  }
};

const trustXConfig: TrustXIDVConfig = {
  walletApiUrl: 'https://example-api.io/api',
};

describe('TrustX Biometric Plugin Unit Tests', () => {
  let provider: IDVProvider;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new EventEmitter for each test
    eventEmitter = new EventEmitter();
    eventEmitter.setMaxListeners(20); // Prevent memory leak warnings
    
    // Initialize the provider
    provider = createTrustXIDVProvider({
      wallet: mockWallet,
      eventEmitter,
      configs: trustXConfig,
    });
    
    // Mock axios post for create-trustx-process-token endpoint
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/create-trustx-process-token')) {
        // Use setTimeout to ensure the API call completes before checking for events
        return Promise.resolve({
          data: {
            uiUrl: 'https://example.com/trustx-ui/process123',
          }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('enroll method', () => {
    it('should call create-trustx-process-token with wallet DID', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Mock axios to simulate successful API call
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uiUrl: 'https://example.com/trustx-ui/process123',
        }
      });
      
      // Start the enrollment process but don't await it yet
      const enrollPromise = provider.enroll(walletDID, proofRequest);
      
      // Use setTimeout to ensure the promise has time to register event handlers
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify axios was called with the correct URL and payload
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://example-api.io/api/create-trustx-process-token',
        { dock_wallet_id: walletDID }
      );
      
      // Simulate the completion event
      eventEmitter.emit(IDV_EVENTS.onComplete, {
        enrollmentCredential: mockEnrollmentCredential,
        matchCredential: mockMatchCredential
      });
      
      // Wait for the promise to resolve
      const result = await enrollPromise;
      
      // Check the result
      expect(result).toHaveProperty('enrollmentCredential');
      expect(result).toHaveProperty('matchCredential');
      expect(result.enrollmentCredential).toEqual(mockEnrollmentCredential);
      expect(result.matchCredential).toEqual(mockMatchCredential);
    }, 10000);

    it('should emit onDeepLink event with the UI URL', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Create a listener to capture emissions
      let deepLinkEmitted = false;
      let deepLinkUrl = '';
      
      eventEmitter.on(IDV_EVENTS.onDeepLink, (url) => {
        deepLinkEmitted = true;
        deepLinkUrl = url;
      });
      
      // Mock axios to simulate successful API call
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uiUrl: 'https://example.com/trustx-ui/process123',
        }
      });
      
      // Start the enrollment process
      const enrollPromise = provider.enroll(walletDID, proofRequest);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify onDeepLink was emitted with the URL from the API
      expect(deepLinkEmitted).toBe(true);
      expect(deepLinkUrl).toBe('https://example.com/trustx-ui/process123');
      
      // Simulate completion to resolve the promise
      eventEmitter.emit(IDV_EVENTS.onComplete, {
        enrollmentCredential: mockEnrollmentCredential,
        matchCredential: mockMatchCredential
      });
      
      await enrollPromise;
    }, 10000);

    it('should handle API errors properly', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Mock API failure
      mockedAxios.post.mockRejectedValueOnce(new Error('API failed'));
      
      // Expect the enrollment to fail
      await expect(provider.enroll(walletDID, proofRequest)).rejects.toThrow('API failed');
    });
  });

  describe('match method', () => {
    it('should perform biometric check before matching', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Mock axios to simulate successful API call
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uiUrl: 'https://example.com/trustx-ui/process123',
        }
      });
      
      // Start the match process but don't await it yet
      const matchPromise = provider.match(walletDID, mockEnrollmentCredential, proofRequest);
      
      // Use setTimeout to ensure the promise has time to register event handlers
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify biometric check was performed
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      });
      
      // Simulate completion to resolve the promise
      eventEmitter.emit(IDV_EVENTS.onComplete, {
        matchCredential: mockMatchCredential
      });
      
      await matchPromise;
    }, 10000);

    it('should call create-trustx-process-token with wallet DID and enrollment ID', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Mock axios to simulate successful API call
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uiUrl: 'https://example.com/trustx-ui/process123',
        }
      });
      
      // Start the match process but don't await it yet
      const matchPromise = provider.match(walletDID, mockEnrollmentCredential, proofRequest);
      
      // Use setTimeout to ensure the promise has time to register event handlers
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify axios was called with the correct URL and payload
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://example-api.io/api/create-trustx-process-token',
        { 
          dock_wallet_id: walletDID,
          biometric_enrollment_id: 'enrollment-123'
        }
      );
      
      // Simulate the completion event
      eventEmitter.emit(IDV_EVENTS.onComplete, {
        matchCredential: mockMatchCredential
      });
      
      // Wait for the promise to resolve
      const result = await matchPromise;
      
      // Check the result
      expect(result).toHaveProperty('matchCredential');
      expect(result.matchCredential).toEqual(mockMatchCredential);
    }, 10000);

    it('should emit onDeepLink event with the UI URL', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Create a listener to capture emissions
      let deepLinkEmitted = false;
      let deepLinkUrl = '';
      
      eventEmitter.on(IDV_EVENTS.onDeepLink, (url) => {
        deepLinkEmitted = true;
        deepLinkUrl = url;
      });
      
      // Mock axios to simulate successful API call
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          uiUrl: 'https://example.com/trustx-ui/process123',
        }
      });
      
      // Start the match process
      const matchPromise = provider.match(walletDID, mockEnrollmentCredential, proofRequest);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify onDeepLink was emitted with the URL from the API
      expect(deepLinkEmitted).toBe(true);
      expect(deepLinkUrl).toBe('https://example.com/trustx-ui/process123');
      
      // Simulate completion to resolve the promise
      eventEmitter.emit(IDV_EVENTS.onComplete, {
        matchCredential: mockMatchCredential
      });
      
      await matchPromise;
    }, 10000);

    it('should handle API errors properly', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Mock API failure
      mockedAxios.post.mockRejectedValueOnce(new Error('API failed'));
      
      // Expect the match to fail
      await expect(provider.match(walletDID, mockEnrollmentCredential, proofRequest)).rejects.toThrow('API failed');
    });

    it('should handle biometric check failures', async () => {
      const walletDID = 'did:dock:wallet123';
      const proofRequest = {};
      
      // Mock biometric check failure
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Biometric check failed'));
      
      // Expect the match to fail
      await expect(provider.match(walletDID, mockEnrollmentCredential, proofRequest)).rejects.toThrow('Biometric check failed');
      
      // Verify the API was not called
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});