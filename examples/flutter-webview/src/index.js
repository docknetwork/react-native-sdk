import "./shim";

import { createWallet } from "@docknetwork/wallet-sdk-core/lib/wallet";
import { createDataStore } from "@docknetwork/wallet-sdk-data-store-web/lib/index";
import { createCredentialProvider } from "@docknetwork/wallet-sdk-core/lib/credential-provider";
import { createDIDProvider } from "@docknetwork/wallet-sdk-core/lib/did-provider";
import { setLocalStorageImpl } from "@docknetwork/wallet-sdk-data-store-web/lib/localStorageJSON";

// Here you can define a JSON-RPC storage implementation
// So that all data will be stored in the Flutter App instead of the browser
// For this demo we will be using the browser's local storage
setLocalStorageImpl(global.localStorage);

let dataStore;
let wallet;
let didProvider;
let credentialProvider;
let requestIdCounter = 1;

function generateUniqueId() {
  return `webview-${++requestIdCounter}`;
}

// Sends a message back to Flutter
function sendMessageToFlutter(message) {
  const id = message.id || generateUniqueId();

  if (message.body.type !== "LOG") {
    log(`Sending message to Flutter: ${JSON.stringify(message)}`);
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
}

// Logs messages to Flutter
function log(message) {
  sendMessageToFlutter({ body: { type: "LOG", message } });
}

// Helper to handle errors and send them back to Flutter
function sendError(id, errorMessage, details = null) {
  sendMessageToFlutter({
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
      log(`Importing credential from URI: ${params.credentialOfferUrl}`);
      await credentialProvider.importCredentialFromURI({
        uri: params.credentialOfferUrl,
        didProvider,
      });

      const credentials = await credentialProvider.getCredentials();
      sendMessageToFlutter({
        id,
        body: {
          result: credentials,
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
      sendMessageToFlutter({
        id,
        body: { result: credentials },
      });
    } catch (error) {
      sendError(id, "Failed to get credentials", error.message);
    }
  },

  async clearData({ id }) {
    try {
      await dataStore.documents.removeAllDocuments();
      sendMessageToFlutter({
        id,
        body: { message: "Data cleared" },
      });
    } catch (error) {
      sendError(id, "Failed to clear data", error.message);
    }
  },
};

// Message handler to process incoming Flutter messages and route them to the correct RPC method
async function handleFlutterMessage(message) {
  log("Received message:", message.data);

  let data;
  try {
    data = JSON.parse(message.data);
  } catch (err) {
    console.log("Error parsing message:", err);
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
}

// Initializes wallet, DID provider, and credential provider
async function initializeWallet() {
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

  const defaultDID = await didProvider.getDefaultDID();
  console.log("Wallet initialized with default DID:", defaultDID);

  sendMessageToFlutter({
    body: {
      type: "WALLET_INITIALIZED",
      data: { defaultDID, otherData: "testing demo 33" },
    },
  });
}

initializeWallet();

// Listen for messages from Flutter
window.addEventListener("message", handleFlutterMessage);
