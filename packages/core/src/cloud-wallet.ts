import {
  DataStore,
  DataStoreEvents,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import { logger } from '@docknetwork/wallet-sdk-data-store/src/logger';
import { edvService, EDVService } from '@docknetwork/wallet-sdk-wasm/src/services/edv/service';
import base64url from 'base64url-universal';
import hkdf from 'futoin-hkdf';
import crypto from '@docknetwork/universal-wallet/crypto';

import { utilCryptoService } from '@docknetwork/wallet-sdk-wasm/src/services/util-crypto';

export const SYNC_MARKER_TYPE = 'SyncMarkerDocument';
export const MNEMONIC_WORD_COUNT = 12;
export const KEY_MAPPING_TYPE = 'KeyMappingDocument';
export const HKDF_LENGTH = 32;
export const HKDF_HASH = 'SHA-256';

/**
 * Derives a key from biometric data using HKDF
 * @param biometricData Biometric data from provider
 * @param identifier User's identifier as salt (email, phone number, etc.)
 * @returns Derived key
 */
export function deriveBiometricKey(
  biometricData: Buffer,
  identifier: string,
): Buffer {
  const salt = identifier;

  return hkdf(biometricData, HKDF_LENGTH, { salt, hash: HKDF_HASH });
}

/**
 * Derives EDV keys from biometric data for the KeyMappingVault
 * @param biometricData Biometric data from the provider
 * @param identifier User's identifier as additional entropy (email, phone number, etc.)
 * @returns Keys for accessing the KeyMappingVault
 */
export async function deriveKeyMappingVaultKeys(
  biometricData: Buffer,
  identifier: string
): Promise<{ hmacKey: string; agreementKey: string; verificationKey: string }> {
  const seedBuffer = deriveBiometricKey(biometricData, identifier);
  const masterKey = base64url.encode(seedBuffer);

  return edvService.deriveKeys(masterKey);
}

/**
 * Generates a key for encrypting/decrypting the master key
 * @param biometricData Biometric data from provider
 * @param identifier User's identifier as salt (email, phone number, etc.)
 * @returns Encryption key and IV for AES encryption
 */
export async function deriveBiometricEncryptionKey(
  biometricData: Buffer,
  identifier: string
): Promise<{ key: Buffer; iv: Buffer }> {
  const key = deriveBiometricKey(biometricData, identifier);

  const ivBuffer = await crypto.subtle.digest('SHA-256', key);
  const iv = Buffer.from(ivBuffer).subarray(0, 16);

  return {
    key,
    iv
  };
}

/**
 * Encrypts the master key using a key derived from biometric data
 * @param masterKey The CloudWalletVault master key to encrypt
 * @param encryptionKey Key derived from biometric data
 * @param iv Initialization vector
 * @returns Encrypted master key
 */
export async function encryptMasterKey(
  masterKey: string,
  encryptionKey: Buffer,
  iv: Buffer
): Promise<string> {
  const keyData = new Uint8Array(encryptionKey);
  const ivData = new Uint8Array(iv);
  const data = new TextEncoder().encode(masterKey);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivData },
    key,
    data
  );

  const encryptedBase64 = base64url.encode(encryptedBuffer);

  return encryptedBase64;
}

/**
 * Decrypts the master key using biometric-derived key
 * @param encryptedKey The encrypted master key
 * @param decryptionKey Key derived from biometric data
 * @param iv Initialization vector
 * @returns The decrypted master key
 */
export async function decryptMasterKey(
  encryptedKey: string,
  decryptionKey: Buffer,
  iv: Buffer
): Promise<string> {
  try {
    const keyData = new Uint8Array(decryptionKey);
    const ivData = new Uint8Array(iv);

    const encryptedData = base64url.decode(encryptedKey);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivData },
      key,
      encryptedData
    );

    const decrypted = new TextDecoder().decode(decryptedBuffer);

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: Invalid key or corrupted data');
  }
}

/**
 * Initializes the KeyMappingVault using biometric data
 * @param edvUrl URL for the edv
 * @param authKey Auth key for the edv
 * @param biometricData User's biometric data
 * @param identifier User's identifier (email, phone number, etc.)
 * @returns Initialized EDV service
 */
export async function initializeKeyMappingVault(
  edvUrl: string,
  authKey: string,
  biometricData: Buffer,
  identifier: string
): Promise<any> {
  const {
    hmacKey,
    agreementKey,
    verificationKey
  } = await deriveKeyMappingVaultKeys(biometricData, identifier);

  const keyMappingEdvService = new EDVService();
  await keyMappingEdvService.initialize({
    hmacKey,
    agreementKey,
    verificationKey,
    edvUrl,
    authKey
  });

  return keyMappingEdvService;
}

/**
 * Enrolls a user by creating necessary vaults and keys
 * @param edvUrl URL for the edv
 * @param authKey Auth key for the edv
 * @param biometricData Biometric data from provider
 * @param identifier User's identifier (email, phone number, etc.)
 * @returns The master key and mnemonic for backup
 */
export async function enrollUserWithBiometrics(
  edvUrl: string,
  authKey: string,
  biometricData: Buffer,
  identifier: string
): Promise<{ masterKey: string; mnemonic: string }> {
  const keyMappingEdv = await initializeKeyMappingVault(
    edvUrl,
    authKey,
    biometricData,
    identifier
  );

  const { mnemonic, masterKey } = await generateCloudWalletMasterKey();
  const { key: encryptionKey, iv } = await deriveBiometricEncryptionKey(biometricData, identifier);
  const encryptedMasterKey = await encryptMasterKey(masterKey, encryptionKey, iv);

  await keyMappingEdv.insert({
    document: {
      content: {
        id: identifier,
        type: KEY_MAPPING_TYPE,
        encryptedKey: encryptedMasterKey
      }
    }
  });

  return { masterKey, mnemonic };
}

/**
 * Gets the master key from the key mapping vault using provided decryption keys
 * @param keyMappingEdv Initialized key mapping vault service
 * @param identifier User's identifier (email, phone number, etc.)
 * @param decryptionKey Key for decrypting the master key
 * @param iv Initialization vector for decryption
 * @returns The decrypted master key for CloudWalletVault
 */
export async function getKeyMappingMasterKey(
  keyMappingEdv: any,
  identifier: string,
  decryptionKey: Buffer,
  iv: Buffer
): Promise<string> {
  const result = await keyMappingEdv.find({
    equals: {
      'content.id': identifier
    }
  });

  if (!result.documents || result.documents.length === 0) {
    throw new Error('Authentication failed: Invalid identifier');
  }

  // If there are multiple documents, try each one until one works
  for (let i = 0; i < result.documents.length; i += 1) {
    const keyMappingDoc = result.documents[i];
    const encryptedKey = keyMappingDoc.content.encryptedKey;

    try {
      const masterKey = await decryptMasterKey(encryptedKey, decryptionKey, iv);
      return masterKey;
    } catch (error) {
      if (i < result.documents.length - 1) {
        // Try the next document
        continue;
      }
      throw new Error('Authentication failed: Invalid decryption key');
    }
  }
}

/**
 * Authenticates a user with biometric data and identifier
 * @param edvUrl URL for the edv
 * @param authKey Auth key for the edv
 * @param biometricData Biometric data from the provider
 * @param identifier User's identifier (email, phone number, etc.)
 * @returns The decrypted master key for CloudWalletVault
 */
export async function authenticateWithBiometrics(
  edvUrl: string,
  authKey: string,
  biometricData: Buffer,
  identifier: string
): Promise<string> {
  const keyMappingEdv = await initializeKeyMappingVault(
    edvUrl,
    authKey,
    biometricData,
    identifier
  );

  const { key: decryptionKey, iv } = await deriveBiometricEncryptionKey(biometricData, identifier);

  return getKeyMappingMasterKey(keyMappingEdv, identifier, decryptionKey, iv);
}

/**
 * Initializes the Cloud Wallet using biometric authentication
 * @param edvUrl Cloud wallet vault URL
 * @param authKey Cloud wallet auth key
 * @param biometricData User's biometric data
 * @param identifier User's identifier (email, phone number, etc.)
 * @param dataStore Optional data store for the wallet
 * @returns Initialized cloud wallet
 */
export async function initializeCloudWalletWithBiometrics(
  edvUrl: string,
  authKey: string,
  biometricData: any,
  identifier: string,
  dataStore?: any
): Promise<any> {
  const masterKey = await authenticateWithBiometrics(
    edvUrl,
    authKey,
    biometricData,
    identifier
  );

  return initializeCloudWallet({
    dataStore,
    edvUrl,
    authKey,
    masterKey
  });
}

interface QueuedOperation {
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface DocumentQueue {
  operations: QueuedOperation[];
  isProcessing: boolean;
}

export async function generateCloudWalletMasterKey(): Promise<{ mnemonic: string; masterKey: string }> {
  const mnemonic = await utilCryptoService.mnemonicGenerate(MNEMONIC_WORD_COUNT);

  const seedBytes = await utilCryptoService.mnemonicToMiniSecret(mnemonic);
  const masterKey = base64url.encode(Buffer.from(seedBytes));

  return {
    mnemonic,
    masterKey,
  };
}

export async function recoverCloudWalletMasterKey(mnemonic: string): Promise<string> {
  const seedBytes = await utilCryptoService.mnemonicToMiniSecret(mnemonic);
  const masterKey = base64url.encode(Buffer.from(seedBytes));

  return masterKey;
}

export async function initializeCloudWallet({
  dataStore,
  edvUrl,
  authKey,
  masterKey,
}: {
  dataStore?: DataStore;
  edvUrl: string;
  authKey: string;
  masterKey: any;
}) {
  const {
    hmacKey,
    agreementKey,
    verificationKey,
  } = await edvService.deriveKeys(masterKey);

  await edvService.initialize({
    hmacKey,
    agreementKey,
    verificationKey,
    edvUrl,
    authKey
  });

  const documentQueues = new Map<string, DocumentQueue>();
  const activeOperations = new Set<Promise<any>>();

  async function processQueue(docId: string) {
    const queue = documentQueues.get(docId);
    if (!queue || queue.isProcessing) {
      return;
    }

    queue.isProcessing = true;

    while (queue.operations.length > 0) {
      const item = queue.operations.shift();
      if (!item) {
        continue;
      }

      let operationPromise: Promise<any>;
      try {
        operationPromise = item.operation();
        activeOperations.add(operationPromise);

        const result = await operationPromise;
        item.resolve(result);
      } catch (error) {
        item.reject(error);
        logger.error(`Operation failed for document ${docId}: ${error.message}`);
      } finally {
        activeOperations.delete(operationPromise);
      }
    }

    queue.isProcessing = false;
    documentQueues.delete(docId);
  }

  async function enqueueOperation(docId: string, operation: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      let queue = documentQueues.get(docId);
      if (!queue) {
        queue = { operations: [], isProcessing: false };
        documentQueues.set(docId, queue);
      }

      queue.operations.push({ operation, resolve, reject });

      // Ensure processQueue runs (even if it was already running)
      if (!queue.isProcessing) {
        setTimeout(() => processQueue(docId), 0);
      }
    });
  }

  function waitForEdvIdle(): Promise<void> {
    return new Promise((resolve) => {
      const checkIdle = () => {
        const hasActiveOperations = activeOperations.size > 0;
        const hasQueuedOperations = Array.from(documentQueues.values()).some(queue => queue.operations.length > 0);

        if (!hasActiveOperations && !hasQueuedOperations) {
          resolve();
        } else {
          setTimeout(checkIdle, 100); // Re-check until everything is idle
        }
      };

      checkIdle();
    });
  }

  async function findDocumentByContentId(id) {
    const result = await edvService.find({
      equals: {
        'content.id': id,
      },
    });

    return result.documents[0];
  }

  async function updateDocumentByContentId(documentContent) {
    const edvDocument = await findDocumentByContentId(documentContent.id);

    if (!edvDocument) {
      throw new Error('Document not found in EDV');
    }

    logger.debug(`Updating document ${documentContent.id} in EDV`);

    await edvService.update({
      document: {
        id: edvDocument.id,
        content: documentContent,
      },
    });

    logger.debug(`Document ${documentContent.id} updated in EDV`);
  }

  async function addDocumentHandler(content) {
    return enqueueOperation(content.id, async () => {
      try {
        logger.debug(`Adding document to EDV: ${content.id}`);
        await edvService.insert({
          document: {
            content: content,
          },
        });
        logger.debug(`Document added to EDV: ${content.id}`);
      } catch (error) {
        logger.error(`Unable to add document ${content.id}: ${error.message}`);
      }
    });
  }

  async function removeDocumentHandler(documentId) {
    return enqueueOperation(documentId, async () => {
      try {
        logger.debug(`Removing document from EDV: ${documentId}`);
        const edvDocument = await findDocumentByContentId(documentId);
        await edvService.delete({ document: edvDocument });
        // TODO: Remove this once we figure out why the data store is empty after deleting a document
        await pullDocuments();
        logger.debug(`Document removed from EDV: ${documentId}`);
      } catch (error) {
        logger.error(`Unable to remove document ${documentId}: ${error.message}`);
      }
    });
  }

  async function updateDocumentHandler(documentContent) {
    return enqueueOperation(documentContent.id, async () => {
      try {
        await updateDocumentByContentId(documentContent);
      } catch (error) {
        logger.error(`Unable to update document ${documentContent.id}: ${error.message}`);
      }
    });
  }

  dataStore.events.on(DataStoreEvents.DocumentCreated, addDocumentHandler);
  dataStore.events.on(DataStoreEvents.DocumentDeleted, removeDocumentHandler);
  dataStore.events.on(DataStoreEvents.DocumentUpdated, updateDocumentHandler);


  function unsubscribeEventListeners() {
    dataStore.events.off(DataStoreEvents.DocumentCreated, addDocumentHandler);
    dataStore.events.off(DataStoreEvents.DocumentDeleted, removeDocumentHandler);
    dataStore.events.off(DataStoreEvents.DocumentUpdated, updateDocumentHandler);
  }

  async function getSyncMarkerDiff() {
    const edvSyncMaker = await findDocumentByContentId(SYNC_MARKER_TYPE);
    const localSyncMarker = await dataStore.documents.getDocumentById(
      SYNC_MARKER_TYPE,
    );

    return edvSyncMaker?.content?.updatedAt - localSyncMarker?.updatedAt;
  }

  async function pushSyncMarker() {
    const edvSyncMarker = await findDocumentByContentId(SYNC_MARKER_TYPE);
    const syncMarker = {
      id: SYNC_MARKER_TYPE,
      type: SYNC_MARKER_TYPE,
      updatedAt: Date.now(),
    };

    if (edvSyncMarker) {
      await dataStore.documents.updateDocument(syncMarker);
    } else {
      await dataStore.documents.addDocument(syncMarker);
    }
  }

  async function pullDocuments() {
    const allDocs = await edvService.find({});

    for (const doc of allDocs.documents) {
      const edvDoc = doc.content;
      const walletDoc = await dataStore.documents.getDocumentById(edvDoc.id);

      if (!walletDoc) {
        const result = await dataStore.documents.addDocument(edvDoc, {
          stopPropagation: true,
        });
      }
    }
  }

  async function clearEdvDocuments() {
    const allDocs = await edvService.find({});

    for (const doc of allDocs.documents) {
      await edvService.delete({ document: doc });
    }
  }

  return {
    clearEdvDocuments,
    pushSyncMarker,
    getSyncMarkerDiff,
    findDocumentByContentId,
    updateDocumentByContentId,
    waitForEdvIdle,
    pullDocuments,
    unsubscribeEventListeners,
  };
}
