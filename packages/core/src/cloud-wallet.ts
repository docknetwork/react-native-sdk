import {
  DataStore,
  DataStoreEvents,
} from '@docknetwork/wallet-sdk-data-store/src/types';

import HMAC from './hmac';
import {X25519KeyAgreementKey2020} from '@digitalbazaar/x25519-key-agreement-key-2020';
import {getKeypairFromDoc, getKeydocFromPair} from '@docknetwork/universal-wallet/methods/keypairs';
import EDVHTTPStorageInterface from '@docknetwork/universal-wallet/storage/edv-http-storage';
import {IWallet} from './types';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {didService} from '@docknetwork/wallet-sdk-wasm/src/services/dids/service';
import {keyringService} from '@docknetwork/wallet-sdk-wasm/src/services/keyring';
import {Ed25519VerificationKey2018} from '@digitalbazaar/ed25519-verification-key-2018';

export const SYNC_MARKER_TYPE = 'SyncMarkerDocument';

export async function generateEDVKeys() {
  await keyringService.initialize({
    ss58Format: 22,
  });
  const keyPair = await didService.generateKeyDoc({});

  const verificationKey = await Ed25519VerificationKey2018.generate({
    controller: keyPair.controller,
    id: keyPair.id,
  });

  const agreementKey = await X25519KeyAgreementKey2020.generate({
    controller: keyPair.controller,
  });
  const hmacKey = await HMAC.exportKey(await HMAC.generateKey());

  return {verificationKey, agreementKey, hmacKey};
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
  const hmac = await HMAC.create({
    key: hmacKey,
  });
  const keyAgreementKey = await X25519KeyAgreementKey2020.from(agreementKey);
  const keys = {
    keyAgreementKey,
    hmac,
  };

  const {controller} = verificationKey;
  const invocationSigner = getKeypairFromDoc(verificationKey);
  invocationSigner.sign = invocationSigner.signer().sign;

  const storageInterface = new EDVHTTPStorageInterface({
    url: edvUrl,
    keys,
    invocationSigner,
    defaultHeaders: {
      DockAuth: authKey,
    },
  });

  let edvId;
  try {
    console.log('Creating EDV with controller:', controller);
    edvId = await storageInterface.createEdv({
      sequence: 0,
      controller,
    });
  } catch (e) {
    const existingConfig = await storageInterface.findConfigFor(controller);
    edvId = existingConfig && existingConfig.id;
    if (!edvId) {
      logger.error('Unable to create or find primary EDV:');
      throw e;
    }
  }

  logger.log(`EDV found/created: ${edvId} - connecting to it`);
  storageInterface.connectTo(edvId);

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
    const result = await storageInterface.find({
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

    await storageInterface.update({
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
      await storageInterface.insert({
        document: {
          content: content,
        },
      });
      logger.debug(`Document added to EDV: ${content.id}`);
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
      await storageInterface.delete({document: edvDocument});
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

  await storageInterface.client.ensureIndex({
    attribute: 'content.id',
    unique: true,
  });

  await storageInterface.client.ensureIndex({
    attribute: 'content.type',
  });

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
    const allDocs = await storageInterface.find({});

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
    const allDocs = await storageInterface.find({});

    for (const doc of allDocs.documents) {
      await storageInterface.delete({document: doc});
    }
  }

  return {
    edvId,
    clearEdvDocuments,
    pushSyncMarker,
    getSyncMarkerDiff,
    storageInterface,
    findDocumentByContentId,
    updateDocumentByContentId,
    waitForEdvIdle,
    pullDocuments,
  };
}
