import {
  DataStore,
  DataStoreEvents,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {edvService} from '@docknetwork/wallet-sdk-wasm/src/services/edv';

export const SYNC_MARKER_TYPE = 'SyncMarkerDocument';

export function generateEDVKeys() {
  return edvService.generateKeys()
}

export async function initializeCloudWallet({
  dataStore,
  edvUrl,
  agreementKey,
  verificationKey,
  hmacKey,
  authKey,
}: {
  dataStore?: DataStore;
  edvUrl: string;
  agreementKey: any;
  verificationKey: any;
  hmacKey: any;
  authKey: string;
}) {

  await edvService.initialize({
    hmacKey,
    agreementKey,
    verificationKey,
    edvUrl,
    authKey
  });

  let pendingOperations = 0;
  let pendingOperationsResolvers = [];

  function waitForEdvIdle() {
    if (pendingOperations === 0) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      pendingOperationsResolvers.push(resolve);
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
    pendingOperations++;
    try {
      logger.debug(`Adding document to EDV: ${content.id}`);
      await edvService.insert({
        document: {
          content: content,
        },
      });
      logger.debug(`Document added to EDV: ${content.id}`);
    } catch(err) {
      console.error('Unable to add document', content);
    } finally {
      pendingOperations--;
      if (pendingOperations === 0) {
        pendingOperationsResolvers.forEach(resolve => resolve());
        pendingOperationsResolvers = [];
      }
    }
  }

  async function removeDocumentHandler(documentId) {
    pendingOperations++;
    try {
      logger.debug(`Removing document from EDV: ${documentId}`);
      const edvDocument = await findDocumentByContentId(documentId);
      await edvService.delete({document: edvDocument});
      logger.debug(`Document removed from EDV: ${documentId}`);
    } finally {
      pendingOperations--;
      if (pendingOperations === 0) {
        pendingOperationsResolvers.forEach(resolve => resolve());
        pendingOperationsResolvers = [];
      }
    }
  }

  async function updateDocumentHandler(documentContent) {
    pendingOperations++;
    try {
      await updateDocumentByContentId(documentContent);
    } finally {
      pendingOperations--;
      if (pendingOperations === 0) {
        pendingOperationsResolvers.forEach(resolve => resolve());
        pendingOperationsResolvers = [];
      }
    }
  }

  dataStore.events.on(DataStoreEvents.DocumentCreated, addDocumentHandler);
  dataStore.events.on(DataStoreEvents.DocumentDeleted, removeDocumentHandler);
  dataStore.events.on(DataStoreEvents.DocumentUpdated, updateDocumentHandler);

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
  };
}
