/**
 * Integration tests for RPC methods
 * Tests all RPC methods without mocking - real integration testing
 */

import './shim';
import { createWallet } from "@docknetwork/wallet-sdk-core/lib/wallet";
import { createDataStore } from "@docknetwork/wallet-sdk-data-store-web/lib/index";
import { createCredentialProvider } from "@docknetwork/wallet-sdk-core/lib/credential-provider";
import { createVerificationController } from "@docknetwork/wallet-sdk-core/lib/verification-controller";
import { createDIDProvider } from "@docknetwork/wallet-sdk-core/lib/did-provider";
import { setLocalStorageImpl } from "@docknetwork/wallet-sdk-data-store-web/lib/localStorageJSON";

// Mock localStorage for testing
const mockLocalStorage = {
  storage: {},
  getItem: function(key) {
    return this.storage[key] || null;
  },
  setItem: function(key, value) {
    this.storage[key] = value;
  },
  removeItem: function(key) {
    delete this.storage[key];
  },
  clear: function() {
    this.storage = {};
  }
};

// Mock global Toaster for message handling
global.Toaster = {
  messages: [],
  postMessage: function(message) {
    this.messages.push(JSON.parse(message));
  },
  getLastMessage: function() {
    return this.messages[this.messages.length - 1];
  },
  clear: function() {
    this.messages = [];
  }
};

global.localStorage = mockLocalStorage;
setLocalStorageImpl(mockLocalStorage);

describe('RPC Methods Integration Tests', () => {
  let dataStore;
  let wallet;
  let didProvider;
  let credentialProvider;
  let requestIdCounter = 1;

  function generateUniqueId() {
    return `test-${++requestIdCounter}`;
  }

  function sendMessageToHost(message) {
    const id = message.id || generateUniqueId();
    const jsonRpcMessage = {
      jsonrpc: "2.0",
      id,
      body: message.body || message,
    };
    global.Toaster.postMessage(JSON.stringify(jsonRpcMessage));
  }

  function sendError(id, errorMessage, details = null) {
    sendMessageToHost({
      id,
      body: {
        error: errorMessage,
        details,
      },
    });
  }

  const rpcMethods = {
    async importCredential({ id, params }) {
      try {
        const credential = await credentialProvider.importCredentialFromURI({
          uri: params.credentialOfferUri,
          didProvider,
        });

        sendMessageToHost({
          id,
          body: {
            result: credential,
            message: "Credential successfully imported",
          },
        });
      } catch (error) {
        sendError(id, "Failed to import credential", error.message);
      }
    },

    async getCredentials({ id }) {
      try {
        const credentials = await credentialProvider.getCredentials();
        sendMessageToHost({
          id,
          body: { result: credentials },
        });
      } catch (error) {
        sendError(id, "Failed to get credentials", error.message);
      }
    },

    async createPresentation({ id, params }) {
      const { credentialId, proofRequestUrl, attributesToReveal } = params;

      try {
        const proofRequestJson = await fetch(proofRequestUrl).then(res => res.json());

        const credential = await credentialProvider.getById(credentialId);

        if (!credential) {  
          sendMessageToHost({
            id,
            body: {
              error: `Credential with id ${credentialId} not found`,
            },
          });
          return;
        }

        const verificationController = createVerificationController({
          wallet,
        });
      
        await verificationController.start({
          template: proofRequestJson,
        });
      
        verificationController.selectedCredentials.set(credential.id, {
          credential: credential,
          attributesToReveal: attributesToReveal
        });
      
        const presentation = await verificationController.createPresentation();
      
        sendMessageToHost({
          id,
          body: { result: presentation },
        });
      } catch (error) {
        sendError(id, "Failed to create presentation", error.message);
      }
    },

    async clearData({ id }) {
      try {
        await dataStore.documents.removeAllDocuments();
        sendMessageToHost({
          id,
          body: { message: "Data cleared" },
        });
      } catch (error) {
        sendError(id, "Failed to clear data", error.message);
      }
    },
  };

  async function handleMessage(data) {
    const { body, id } = data || {};
    if (!body?.method) {
      sendError(id, "Invalid request: method not specified", body);
      return;
    }

    const methodHandler = rpcMethods[body.method];
    if (methodHandler) {
      await methodHandler({ id, params: body.params });
    } else {
      sendError(id, "Method Not Found", body.method);
    }
  }

  beforeAll(async () => {
    jest.setTimeout(30000);
    
    dataStore = await createDataStore({
      databasePath: "dock-wallet-test",
      defaultNetwork: "testnet",
    });

    wallet = await createWallet({ dataStore });
    didProvider = createDIDProvider({ wallet });
    credentialProvider = createCredentialProvider({ wallet });
  });

  beforeEach(() => {
    global.Toaster.clear();
    requestIdCounter = 1;
  });

  afterAll(async () => {
    if (dataStore && dataStore.documents) {
      await dataStore.documents.removeAllDocuments();
    }
  });

  describe('getCredentials RPC method', () => {
    test('should return empty credentials list initially', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'getCredentials'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.result).toEqual([]);
    });

    test('should handle errors gracefully', async () => {
      const requestId = generateUniqueId();
      const originalGetCredentials = credentialProvider.getCredentials;
      credentialProvider.getCredentials = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'getCredentials'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Failed to get credentials');
      expect(response.body.details).toBe('Test error');

      credentialProvider.getCredentials = originalGetCredentials;
    });
  });

  describe('clearData RPC method', () => {
    test('should clear data successfully', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'clearData'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.message).toBe('Data cleared');
    });

    test('should handle clear data errors', async () => {
      const requestId = generateUniqueId();
      const originalRemoveAllDocuments = dataStore.documents.removeAllDocuments;
      dataStore.documents.removeAllDocuments = jest.fn().mockRejectedValue(new Error('Clear failed'));
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'clearData'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Failed to clear data');
      expect(response.body.details).toBe('Clear failed');

      dataStore.documents.removeAllDocuments = originalRemoveAllDocuments;
    });
  });

  describe('importCredential RPC method', () => {
    test('should handle invalid credential URI', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'importCredential',
          params: {
            credentialOfferUri: 'invalid://uri'
          }
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Failed to import credential');
      expect(response.body.details).toBeDefined();
    });

    test('should handle missing parameters', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'importCredential',
          params: {}
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Failed to import credential');
    });
  });

  describe('createPresentation RPC method', () => {
    test('should handle missing credential', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'createPresentation',
          params: {
            credentialId: 'non-existent-id',
            proofRequestUrl: 'https://example.com/proof-request',
            attributesToReveal: []
          }
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Credential with id non-existent-id not found');
    });

    test('should handle invalid proof request URL', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'createPresentation',
          params: {
            credentialId: 'some-id',
            proofRequestUrl: 'invalid-url',
            attributesToReveal: []
          }
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Failed to create presentation');
    });
  });

  describe('Error handling and invalid requests', () => {
    test('should handle missing method', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {}
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Invalid request: method not specified');
    });

    test('should handle unknown method', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage({
        id: requestId,
        body: {
          method: 'unknownMethod'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(requestId);
      expect(response.body.error).toBe('Method Not Found');
      expect(response.body.details).toBe('unknownMethod');
    });

    test('should handle malformed request data', async () => {
      const requestId = generateUniqueId();
      
      await handleMessage(null);

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.body.error).toBe('Invalid request: method not specified');
    });
  });

  describe('Message ID handling', () => {
    test('should use provided request ID', async () => {
      const customId = 'custom-test-id';
      
      await handleMessage({
        id: customId,
        body: {
          method: 'getCredentials'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBe(customId);
    });

    test('should generate ID when not provided', async () => {
      await handleMessage({
        body: {
          method: 'getCredentials'
        }
      });

      const response = global.Toaster.getLastMessage();
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(typeof response.id).toBe('string');
    });
  });
});