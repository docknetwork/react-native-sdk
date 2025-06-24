import "./shim";

import { createWallet } from "@docknetwork/wallet-sdk-core/lib/wallet";
import { createDataStore } from "@docknetwork/wallet-sdk-data-store-web/lib/index";
import { createCredentialProvider } from "@docknetwork/wallet-sdk-core/lib/credential-provider";
import { createMessageProvider } from "@docknetwork/wallet-sdk-core/lib/message-provider";
import { createVerificationController } from "@docknetwork/wallet-sdk-core/lib/verification-controller";
import { createDIDProvider } from "@docknetwork/wallet-sdk-core/lib/did-provider";
import { setLocalStorageImpl } from "@docknetwork/wallet-sdk-data-store-web/lib/localStorageJSON";

// Here you can define a JSON-RPC storage implementation
// So that all data will be stored in the Host App instead of the browser
// For this demo we will be using the browser's local storage
setLocalStorageImpl(global.localStorage);

let dataStore;
let wallet;
let didProvider;
let credentialProvider;
let messageProvider;
let requestIdCounter = 1;

// Add initialization guard to prevent multiple initializations
let isInitializing = false;
let isInitialized = false;

function generateUniqueId() {
  return `webview-${++requestIdCounter}`;
}

// Sends a message back to Host
function sendMessageToHost(message) {
  try {
    const id = message.id || generateUniqueId();

    if (message.body && message.body.type !== "LOG") {
      log(`Sending message to Host: ${JSON.stringify(message)}`);
    }

    const jsonRpcMessage = {
      jsonrpc: "2.0",
      id,
      body: message.body || message,
    };

    if (!global?.Toaster?.postMessage) {
      console.log("Toaster not found. Logging event:", jsonRpcMessage);
      return;
    }

    global.Toaster.postMessage(JSON.stringify(jsonRpcMessage));
  } catch (error) {
    console.error("Error sending message to Host:", error);
  }
}


async function fetchMessages() {
  await messageProvider.fetchMessages();
  await messageProvider.processDIDCommMessages();
}

global.fetchMessages = fetchMessages;

// Logs messages to Host
function log(message) {
  if (typeof message === "string" && message.trim()) {
    sendMessageToHost({ body: { type: "LOG", message } });
  }
}

// Helper to handle errors and send them back to Host
function sendError(id, errorMessage, details = null) {
  sendMessageToHost({
    id,
    body: {
      error: errorMessage,
      details,
    },
  });
}

// RPC methods implementation - each method can be easily added to this object
const rpcMethods = {
  async importCredential({ id, params }) {
    try {
      if (!isInitialized) {
        throw new Error("Wallet not initialized yet");
      }

      // Fix parameter name to match what's sent from Swift
      const credentialUri =
        params.credentialOfferUri || params.credentialOfferUrl;

      if (!credentialUri) {
        throw new Error("No credential offer URI provided");
      }

      log(`Importing credential from URI: ${credentialUri}`);

      // Add timeout and better error handling
      const importPromise = credentialProvider.importCredentialFromURI({
        uri: credentialUri,
        didProvider,
      });

      // Add a 30-second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(new Error("Credential import timed out after 30 seconds")),
          30000
        );
      });

      try {
        await Promise.race([importPromise, timeoutPromise]);
        log("Credential import completed successfully");
      } catch (importError) {
        log(`Credential import error: ${importError.message}`);
        throw importError;
      }

      const credentials = await credentialProvider.getCredentials();
      const latestCredential = credentials[credentials.length - 1];

      sendMessageToHost({
        id,
        body: {
          result: latestCredential || credentials,
          message: "Credential successfully imported",
        },
      });
    } catch (error) {
      console.error("Import credential error:", error);
      log(`Import credential error: ${error.message}`);
      sendError(
        id,
        "Failed to import credential",
        error.message || error.toString()
      );
    }
  },

  async getCredentials({ id }) {
    try {
      if (!isInitialized) {
        throw new Error("Wallet not initialized yet");
      }

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
    try {
      if (!isInitialized) {
        throw new Error("Wallet not initialized yet");
      }

      const { credentialId, proofRequestUrl, attributesToReveal } = params;

      const proofRequestJson = await fetch(proofRequestUrl).then((res) =>
        res.json()
      );

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
        attributesToReveal: attributesToReveal,
      });

      const presentation = await verificationController.createPresentation();

      log("Presentation created successfully");

      try {
        // Submit presentation directly using fetch to bypass XHR/axios issues
        log(`Submitting presentation to: ${proofRequestJson.response_url}`);
        
        const response = await fetch(proofRequestJson.response_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(presentation)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        log(`Truvera API response: ${JSON.stringify(result)}`);

        sendMessageToHost({
          id,
          body: { result },
        });

        log("Presentation validation successful");
      } catch (validationError) {
        log(`Presentation validation failed: ${validationError.message}`);
        sendError(
          id,
          "Presentation validation failed",
          validationError.message
        );
      }
    } catch (error) {
      sendError(id, "Failed to create presentation", error.message);
    }
  },

  async clearData({ id }) {
    try {
      if (!isInitialized) {
        throw new Error("Wallet not initialized yet");
      }

      await dataStore.documents.removeAllDocuments();
      sendMessageToHost({
        id,
        body: { message: "Data cleared" },
      });
    } catch (error) {
      sendError(id, "Failed to clear data", error.message);
    }
  },

  async proxyNetworkRequest({ id, params }) {
    try {
      const { url, method, body, headers } = params;

      log(`Proxying network request: ${method} ${url}`);

      // Send request to Host to handle natively
      sendMessageToHost({
        id,
        body: {
          method: "proxyNetworkRequest",
          params: { url, method, body, headers },
        },
      });
    } catch (error) {
      sendError(id, "Failed to proxy network request", error.message);
    }
  },

  async fetchMessages({ id }) {
    try {
      await fetchMessages();
      sendMessageToHost({
        id,
        body: { message: "Messages fetched" },
      });
    } catch (error) {
      sendError(id, "Failed to fetch messages", error.message);
    }
  },
};

// Message handler to process incoming Host messages and route them to the correct RPC method
async function handleHostMessage(event) {
  try {
    // Get the actual message data - it could be a string or object
    let messageData = event.data;

    // Skip empty messages
    if (!messageData) {
      return;
    }

    // If it's already an object, use it directly
    let data;
    if (typeof messageData === "object") {
      data = messageData;
    } else if (typeof messageData === "string") {
      // Skip empty string messages
      if (messageData.trim() === "" || messageData === "{}") {
        return;
      }

      try {
        data = JSON.parse(messageData);
      } catch (err) {
        console.log("Error parsing message:", messageData, err);
        return;
      }
    } else {
      console.log("Unknown message type:", typeof messageData);
      return;
    }

    log(`Received message: ${JSON.stringify(data)}`);

    // Skip empty objects
    if (Object.keys(data).length === 0) {
      return;
    }

    const { body, id } = data || {};
    if (!body?.method) {
      sendError(id, "Invalid request: method not specified", body);
      return;
    }

    log(`Handling method ${body.method} with request ID ${id}`);

    const methodHandler = rpcMethods[body.method];
    if (methodHandler) {
      await methodHandler({ id, params: body.params });
    } else {
      sendError(id, "Method Not Found", body.method);
    }
  } catch (error) {
    console.error("Error handling Host message:", error);
  }
}

// Initializes wallet, DID provider, and credential provider
async function initializeWallet() {
  // Prevent multiple initializations
  if (isInitializing || isInitialized) {
    console.log("Wallet initialization already in progress or completed");
    return;
  }

  isInitializing = true;

  try {
    console.log("Starting wallet initialization...");

    dataStore = await createDataStore({
      databasePath: "dock-wallet",
      // Network is hardcoded to testnet
      // You can pass in a different network here
      // Or also switch the network using the wallet.setNetwork method
      defaultNetwork: "testnet",
    });

    wallet = await createWallet({ dataStore });
    didProvider = createDIDProvider({ wallet });
    credentialProvider = createCredentialProvider({ wallet });
    messageProvider = createMessageProvider({ wallet, didProvider });

    const defaultDID = await didProvider.getDefaultDID();
    console.log("Wallet initialized with default DID:", defaultDID);

    isInitialized = true;
    isInitializing = false;

    sendMessageToHost({
      body: {
        type: "WALLET_INITIALIZED",
        data: { defaultDID, },
      },
    });

    messageProvider.addMessageListener(async (message) => {
      if (message.body.credentials) {
        message.body.credentials.forEach(async (credential) => {
          await credentialProvider.addCredential(credential);
        });

        sendMessageToHost({
          body: {
            type: "CREDENTIAL_ADDED",
            data: { credentials: message.body.credentials },
          },
        });
      }
    });

    console.log("Wallet initialization completed successfully");
  } catch (error) {
    console.error("Error initializing wallet:", error);
    isInitializing = false;
    isInitialized = false;

    sendMessageToHost({
      body: {
        type: "WALLET_INITIALIZATION_ERROR",
        data: { error: error.message },
      },
    });
  }
}

// Only initialize if not already done
if (!isInitialized && !isInitializing) {
  // Add a small delay to ensure the page is fully loaded
  setTimeout(() => {
    initializeWallet();
  }, 100);
}

// Listen for messages from Host
if (!window.hostMessageListenerAdded) {
  window.addEventListener("message", handleHostMessage);
  window.hostMessageListenerAdded = true;
  console.log("Host message listener added");
}
