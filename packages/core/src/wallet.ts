/**
 * @module wallet
 * @description Core wallet functionality for the Dock Wallet SDK.
 * This module provides the main wallet creation and management functions.
 */

import {CreateWalletProps, IWallet} from './types';


import {initWalletWasm} from './wallet-wasm';
import {EventEmitter} from 'events';
import {walletService} from '@docknetwork/wallet-sdk-wasm/src/services/wallet';
import {importUniversalWalletDocuments} from '@docknetwork/wallet-sdk-data-store/src/helpers';
import {ensureDID} from './did-provider';
export type {IWallet};

function once(emitter: EventEmitter, eventName: string) {
  return new Promise(resolve => emitter.once(eventName, resolve));
}

/**
 * Ensures a document has the proper @context for Universal Wallet compatibility
 * @param {Object} document - The document to add context to
 * @returns {Object} The document with @context added if it was missing
 * @private
 */
export function ensureDocumentContext(document) {
  if (document['@context']) {
    return document;
  }

  return {
    ...document,
    '@context': ['https://w3id.org/wallet/v1'],
  };
}


/**
 * Possible wallet status values
 * @typedef {'closed' | 'loading' | 'ready' | 'error'} WalletStatus
 */
export type WalletStatus = 'closed' | 'loading' | 'ready' | 'error';

/**
 * Supported keypair types
 * @typedef {'sr25519' | 'ed25519' | 'ecdsa'} KeypairType
 */
export type KeypairType = 'sr25519' | 'ed25519' | 'ecdsa';

export const WalletEvents = {
  ready: 'ready',
  error: 'error',
  migrated: 'migrated',
  statusUpdated: 'status-updated',
  documentAdded: 'document-added',
  documentUpdated: 'document-updated',
  documentRemoved: 'document-removed',
  walletDeleted: 'wallet-deleted',
  walletImported: 'wallet-imported',
  networkUpdated: 'network-updated',
  networkConnected: 'network-connected',
  networkError: 'network-error',
};


/**
 * Creates a new wallet instance with the provided data store.
 * The wallet provides secure storage and management of DIDs, credentials, keys, and other documents.
 * 
 * @param {CreateWalletProps} props - Configuration options for wallet creation
 * @param {DataStore} props.dataStore - The data store implementation to use for persistence
 * @returns {Promise<IWallet>} A promise that resolves to the created wallet instance
 * @see {@link IWallet} - The interface defining all available wallet methods
 * 
 * @example
 * import { createWallet } from '@docknetwork/wallet-sdk-core';
 * import { createDataStore } from '@docknetwork/wallet-sdk-data-store';
 * 
 * const dataStore = await createDataStore();
 * const wallet = await createWallet({ dataStore });
 * 
 * // The wallet implements the IWallet interface
 * await wallet.addDocument(myCredential);
 * const documents = await wallet.getAllDocuments();
 * 
 * @throws {Error} If the data store is not properly initialized
 */
export async function createWallet({
  dataStore,
}: CreateWalletProps): Promise<IWallet> {
  let status;

  const eventEmitter = new EventEmitter();

  const wallet = {
    eventManager: eventEmitter,
    waitForEvent: (eventName: string) => once(eventEmitter, eventName) as any,
    dataStore,
    getStatus() {
      return status;
    },
    resolveDocumentNetwork: async (document: any) => {
      return dataStore.resolveDocumentNetwork({
        document,
        dataStore,
      });
    },
    /**
     * Deletes the entire wallet and all its documents
     * @memberof IWallet
     * @returns {Promise<void>}
     * @fires WalletEvents.walletDeleted
     */
    deleteWallet: async () => {
      await dataStore.documents.removeAllDocuments();

      eventEmitter.emit(WalletEvents.walletDeleted);
    },
    /**
     * Sets the wallet status
     * @memberof IWallet
     * @param {string} newStatus - The new status to set
     */
    setStatus(newStatus: string) {
      status = newStatus;
    },
    /**
     * Sets the active network for the wallet
     * @memberof IWallet
     * @param {string} networkId - The network identifier to switch to
     * @returns {Promise<void>}
     * @fires WalletEvents.networkUpdated
     */
    setNetwork: async (networkId: string) => {
      await dataStore.setNetwork(networkId);
      eventEmitter.emit(WalletEvents.networkUpdated, networkId);
    },
    /**
     * Gets the current network ID
     * @memberof IWallet
     * @returns {string} The current network identifier
     */
    getNetworkId: () => {
      return dataStore.networkId;
    },
    /**
     * Retrieves a document by its ID
     * @memberof IWallet
     * @param {string} id - The unique identifier of the document
     * @returns {Promise<WalletDocument>} The document with the specified ID
     * @throws {Error} If document is not found
     */
    getDocumentById: (id) => dataStore.documents.getDocumentById(id),
    /**
     * Retrieves all documents stored in the wallet
     * @memberof IWallet
     * @returns {Promise<WalletDocument[]>} Array of all documents in the wallet
     */
    getAllDocuments: () => dataStore.documents.getAllDocuments(),
    /**
     * Retrieves multiple documents by their IDs
     * @memberof IWallet
     * @param {string[]} idList - Array of document IDs to retrieve
     * @returns {Promise<WalletDocument[]>} Array of documents matching the provided IDs
     */
    getDocumentsById: (idList) => dataStore.documents.getDocumentsById(idList),
    /**
     * Retrieves all documents of a specific type
     * @memberof IWallet
     * @param {string} type - The document type to filter by (e.g., 'VerifiableCredential', 'DIDDocument')
     * @returns {Promise<WalletDocument[]>} Array of documents matching the specified type
     */
    getDocumentsByType: (type) => dataStore.documents.getDocumentsByType(type),
    /**
     * Adds a new document to the wallet
     * @memberof IWallet
     * @param {any} json - The document to add (must have valid JSON-LD structure)
     * @param {any} [options] - Optional parameters for document creation
     * @returns {Promise<WalletDocument>} The created document with generated metadata
     * @fires WalletEvents.documentAdded
     * @example
     * const credential = {
     *   "@context": ["https://www.w3.org/2018/credentials/v1"],
     *   "type": ["VerifiableCredential"],
     *   "issuer": "did:dock:123",
     *   "credentialSubject": { "name": "John Doe" }
     * };
     * const addedDoc = await wallet.addDocument(credential);
     */
    addDocument: (json: any) => {
      return dataStore.documents.addDocument(json).then(result => {
        eventEmitter.emit(WalletEvents.documentAdded, result);
        return result;
      });
    },
    /**
     * Updates an existing document
     * @memberof IWallet
     * @param {any} document - The document with updated data (must include ID)
     * @param {any} [options] - Optional parameters for document update
     * @returns {Promise<WalletDocument>} The updated document
     * @fires WalletEvents.documentUpdated
     * @throws {Error} If document doesn't exist
     */
    updateDocument: (document: any) => {
      return dataStore.documents.updateDocument(document).then(result => {
        eventEmitter.emit(WalletEvents.documentUpdated, result);
        return result;
      });
    },
    /**
     * Removes a document from the wallet
     * @memberof IWallet
     * @param {string} id - The ID of the document to remove
     * @param {any} [options] - Optional parameters for document removal
     * @returns {Promise<void>}
     * @fires WalletEvents.documentRemoved
     * @throws {Error} If document is not found
     */
    removeDocument: async (id: string) => {
      const document = await wallet.getDocumentById(id);

      return dataStore.documents.removeDocument(id).then(result => {
        eventEmitter.emit(WalletEvents.documentRemoved, document);
        return result;
      });
    },
    /**
     * Gets all documents correlated to a specific document
     * @memberof IWallet
     * @param {string} documentId - The ID of the document to find correlations for
     * @returns {Promise<WalletDocument[]>} Array of correlated documents
     */
    getDocumentCorrelations: (documentId: string) => {
      return dataStore.documents.getDocumentCorrelations(documentId);
    },
    /**
     * Retrieves the keypair associated with an account
     * @memberof IWallet
     * @param {string} accountId - The account ID to get the keypair for
     * @returns {Promise<any>} The keypair associated with the account
     */
    getAccountKeyPair: async (accountId: string) => {
      const correlations = await dataStore.documents.getDocumentCorrelations(accountId);

      const keyPair = correlations.find(
        correlation => correlation.type === 'KeyringPair',
      );

      return keyPair?.value;
    },
    /**
     * Decrypts and retrieves documents from an encrypted wallet without importing
     * @memberof IWallet
     * @param {any} json - The encrypted wallet JSON
     * @param {string} password - Password to decrypt the wallet
     * @returns {Promise<any>} Array of decrypted documents
     */
    getDocumentsFromEncryptedWallet: async (json: any, password: string) => {
      return walletService.getDocumentsFromEncryptedWallet({
        encryptedJSONWallet: json,
        password,
      });
    },
    /**
     * Imports documents from an encrypted Universal Wallet 2020 JSON
     * @memberof IWallet
     * @param {any} json - The encrypted wallet JSON
     * @param {string} password - Password to decrypt the wallet
     * @returns {Promise<void>}
     * @see {@link https://w3c-ccg.github.io/universal-wallet-interop-spec/}
     * @example
     * // Import from encrypted wallet backup
     * const walletBackup = { ... }; // encrypted wallet JSON
     * await wallet.importUniversalWalletJSON(walletBackup, 'mypassword');
     */
    importUniversalWalletJSON: async (json: any, password: string) => {
      const documents = await walletService.getDocumentsFromEncryptedWallet({
        encryptedJSONWallet: json,
        password,
      });

      await importUniversalWalletDocuments({
        documents,
        dataStore,
      });

      return documents;
    },
    /**
     * Exports specified documents as an encrypted JSON (test)
     * @memberof IWallet
     * @param {Object} params - Export parameters
     * @param {any[]} params.documents - Documents to export
     * @param {string} params.password - Password for encryption
     * @returns {Promise<any>} Encrypted wallet JSON
     */
    exportDocuments: async (params: {documents: any; password: string}) => {
      const documents = params.documents.map(ensureDocumentContext);
      return walletService.exportDocuments({
        documents,
        password: params.password,
      });
    },
    /**
     * Exports the entire wallet as an encrypted Universal Wallet 2020 JSON
     * @memberof IWallet
     * @param {string} password - Password for encryption
     * @returns {any} Encrypted Universal Wallet JSON representation
     * @see {@link https://w3c-ccg.github.io/universal-wallet-interop-spec/}
     * @example
     * // Create encrypted backup of entire wallet
     * const backup = await wallet.exportUniversalWalletJSON('mypassword');
     * // Save backup to file or cloud storage
     */
    exportUniversalWalletJSON: async (password: string) => {
      let documents = await dataStore.documents.getAllDocuments(true);

      const result = await wallet.exportDocuments({
        documents,
        password,
      });

      return result;
    },
  } as IWallet;

  await initWalletWasm(wallet);

  await ensureDID({
    wallet,
  });

  [WalletEvents.networkUpdated, WalletEvents.walletDeleted].forEach(event =>
    eventEmitter.on(event, () => {
      ensureDID({
        wallet,
      });
    }),
  );

  return wallet;
}

/**
 * Deletes the entire wallet and all its documents
 * @param {IWallet} wallet - The wallet instance to delete
 * @returns {Promise<void>}
 * @fires WalletEvents.walletDeleted
 */
export async function deleteWallet(wallet: IWallet): Promise<void> {
  await wallet.dataStore.documents.removeAllDocuments();
  wallet.eventManager.emit(WalletEvents.walletDeleted);
}
