import {
  DataStore,
  DocumentResolverResult,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {EventEmitter} from 'events';

/**
 * Legacy V1 wallet interface for backward compatibility
 * @interface IV1Wallet
 */
export interface IV1Wallet {
  /**
   * Gets the current wallet status
   * @returns {string} The current status (e.g., 'ready', 'loading', 'error')
   */
  getStatus: () => string;
  
  /**
   * Sets the wallet status
   * @param {string} status - The new status to set
   */
  setStatus: (status: string) => void;
  
  /**
   * Event emitter for wallet events
   * @type {EventEmitter}
   */
  eventManager: EventEmitter;
  
  /**
   * Waits for a specific event to be emitted
   * @param {string} eventName - The event name to wait for
   * @returns {Promise<any>} Promise that resolves when the event is emitted
   */
  waitForEvent: (eventName: string) => Promise<any>;
  
  /**
   * Resolves correlations for a document ID
   * @param {string} id - The document ID to resolve correlations for
   * @returns {Promise<WalletDocument[]>} Array of correlated documents
   */
  resolveCorrelations: (id: string) => Promise<WalletDocument[]>;
  
  /**
   * Queries documents by ID or type
   * @param {Object} [params] - Query parameters
   * @param {string} [params.id] - Document ID to search for
   * @param {string} [params.type] - Document type to filter by
   * @returns {Promise<WalletDocument[]>} Array of matching documents
   */
  query: ({
    id,
    type,
  }?: {
    id?: string;
    type?: string;
  }) => Promise<WalletDocument[]>;

  /**
   * Ensures network connection is established
   * @returns {Promise<void>}
   */
  ensureNetwork: () => Promise<void>;
  
  /**
   * Synchronizes wallet data
   * @returns {Promise<void>}
   */
  sync: () => Promise<void>;
  
  /**
   * Removes a document (legacy method)
   * @param {string} id - Document ID to remove
   * @returns {Promise<void>}
   * @deprecated Use removeDocument instead
   */
  remove: (id: string) => Promise<void>;
  
  /**
   * Creates a new document (legacy method)
   * @param {any} json - Document data
   * @returns {Promise<WalletDocument>} The created document
   * @deprecated Use addDocument instead
   */
  create: (json: any) => Promise<WalletDocument>;
  
  /**
   * Updates a document (legacy method)
   * @param {any} json - Updated document data
   * @returns {Promise<WalletDocument>} The updated document
   * @deprecated Use updateDocument instead
   */
  update: (json: any) => Promise<WalletDocument>;
  
  /**
   * Creates or updates a document (legacy method)
   * @param {any} json - Document data
   * @returns {Promise<WalletDocument>} The created or updated document
   * @deprecated Use upsertDocument instead
   */
  upsert: (json: any) => Promise<WalletDocument>;
  
  /**
   * Deletes the entire wallet
   * @returns {Promise<void>}
   * @fires WalletEvents.walletDeleted
   */
  deleteWallet: () => Promise<void>;
}

/**
 * Main wallet interface providing methods for document management, import/export, and network operations.
 * @interface IWallet
 * @extends {IV1Wallet}
 */
export interface IWallet extends IV1Wallet{
  /**
   * Retrieves a document by its ID
   * @param {string} id - The unique identifier of the document
   * @returns {Promise<WalletDocument>} The document with the specified ID
   * @throws {Error} If document is not found
   */
  getDocumentById: (id: string) => Promise<WalletDocument>;
  
  /**
   * Retrieves multiple documents by their IDs
   * @param {string[]} idList - Array of document IDs to retrieve
   * @returns {Promise<WalletDocument[]>} Array of documents matching the provided IDs
   */
  getDocumentsById: (idList: string[]) => Promise<WalletDocument[]>;
  
  /**
   * Retrieves all documents of a specific type
   * @param {string} type - The document type to filter by (e.g., 'VerifiableCredential', 'DIDDocument')
   * @returns {Promise<WalletDocument[]>} Array of documents matching the specified type
   */
  getDocumentsByType: (type: string) => Promise<WalletDocument[]>;
  
  /**
   * Retrieves all documents stored in the wallet
   * @returns {Promise<WalletDocument[]>} Array of all documents in the wallet
   */
  getAllDocuments: () => Promise<WalletDocument[]>;
  
  /**
   * Adds a new document to the wallet
   * @param {any} json - The document to add (must have valid JSON-LD structure)
   * @param {any} [options] - Optional parameters for document creation
   * @returns {Promise<WalletDocument>} The created document with generated metadata
   * @fires WalletEvents.documentAdded
   */
  addDocument: (json: any, options?: any) => Promise<WalletDocument>;
  
  /**
   * Creates or updates a document based on its ID
   * @param {any} json - The document to create or update
   * @param {any} [options] - Optional parameters for the operation
   * @returns {Promise<WalletDocument>} The created or updated document
   */
  upsertDocument: (json: any, options?: any) => Promise<WalletDocument>;
  
  /**
   * Updates an existing document
   * @param {any} json - The document with updated data (must include ID)
   * @param {any} [options] - Optional parameters for document update
   * @returns {Promise<WalletDocument>} The updated document
   * @fires WalletEvents.documentUpdated
   * @throws {Error} If document doesn't exist
   */
  updateDocument: (json: any, options?: any) => Promise<WalletDocument>;
  
  /**
   * Gets all documents correlated to a specific document
   * @param {string} documentId - The ID of the document to find correlations for
   * @returns {Promise<WalletDocument[]>} Array of correlated documents
   */
  getDocumentCorrelations: (documentId: string) => Promise<WalletDocument[]>;
  
  /**
   * Retrieves the keypair associated with an account
   * @param {string} accountId - The account ID to get the keypair for
   * @returns {Promise<any>} The keypair associated with the account
   */
  getAccountKeyPair: (accountId: string) => Promise<any>;
  
  /**
   * Removes a document from the wallet
   * @param {string} id - The ID of the document to remove
   * @param {any} [options] - Optional parameters for document removal
   * @returns {Promise<void>}
   * @fires WalletEvents.documentRemoved
   * @throws {Error} If document is not found
   */
  removeDocument: (id: string, options?: any) => Promise<void>;
  
  /**
   * Imports documents from an encrypted Universal Wallet 2020 JSON
   * @param {any} json - The encrypted wallet JSON
   * @param {string} password - Password to decrypt the wallet
   * @returns {Promise<void>}
   * @see {@link https://w3c-ccg.github.io/universal-wallet-interop-spec/}
   */
  importUniversalWalletJSON: (json: any, password: string) => Promise<void>;
  
  /**
   * Decrypts and retrieves documents from an encrypted wallet without importing
   * @param {any} json - The encrypted wallet JSON
   * @param {string} password - Password to decrypt the wallet
   * @returns {Promise<any>} Array of decrypted documents
   */
  getDocumentsFromEncryptedWallet: (
    json: any,
    password: string,
  ) => Promise<any>;
  
  /**
   * Exports specified documents as an encrypted JSON
   * @param {Object} params - Export parameters
   * @param {any[]} params.documents - Documents to export
   * @param {string} params.password - Password for encryption
   * @returns {Promise<any>} Encrypted wallet JSON
   */
  exportDocuments: (params: {documents: any; password: string}) => Promise<any>;
  
  /**
   * Exports the entire wallet as an encrypted Universal Wallet 2020 JSON
   * @param {string} password - Password for encryption
   * @returns {any} Encrypted Universal Wallet JSON representation
   * @see {@link https://w3c-ccg.github.io/universal-wallet-interop-spec/}
   */
  exportUniversalWalletJSON: (password: string) => any;

  /**
   * Sets the active network for the wallet
   * @param {string} networkId - The network identifier to switch to
   * @returns {Promise<void>}
   * @fires WalletEvents.networkUpdated
   */
  setNetwork: (networkId: string) => Promise<void>;
  
  /**
   * Gets the current network ID
   * @returns {string} The current network identifier
   */
  getNetworkId: () => string;
  
  /**
   * Resolves network-specific information for a document
   * @param {any} document - The document to resolve network info for
   * @returns {Promise<DocumentResolverResult>} Network resolution result
   */
  resolveDocumentNetwork: (document: any) => Promise<DocumentResolverResult>;
  
  /**
   * The underlying data store instance
   * @type {DataStore}
   */
  dataStore: DataStore;
  
  /**
   * Network check interval handle (if periodic checks are enabled)
   * @type {NodeJS.Timeout | number | undefined}
   */
  networkCheckInterval?: NodeJS.Timeout | number;
};

export type CrateWalletWithDataStore = {
  
}

export type CreateWalletProps = {
  dataStore: DataStore;
}
