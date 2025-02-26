import {
  DataStore,
  DataStoreEvents,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {edvService} from '@docknetwork/wallet-sdk-wasm/src/services/edv';
import base64url from 'base64url-universal';

import {utilCryptoService} from '@docknetwork/wallet-sdk-wasm/src/services/util-crypto';

export const SYNC_MARKER_TYPE = 'SyncMarkerDocument';

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
  const mnemonic = await utilCryptoService.mnemonicGenerate(12);

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
      } catch(error) {
        logger.error(`Unable to add document ${content.id}: ${error.message}`);
      }
    });
  }

  async function removeDocumentHandler(documentId) {
    return enqueueOperation(documentId, async () => {
      try {
        logger.debug(`Removing document from EDV: ${documentId}`);
        const edvDocument = await findDocumentByContentId(documentId);
        await edvService.delete({document: edvDocument});
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
      await edvService.delete({document: doc});
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
