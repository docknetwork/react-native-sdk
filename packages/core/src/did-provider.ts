import {IWallet} from './types';
import {didServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/dids/index';
import assert from 'assert';

export async function importDID({
  wallet,
  encryptedJSONWallet,
  password,
}: {
  wallet: IWallet;
  encryptedJSONWallet: any;
  password: string;
}) {
  try {
    const rawDocs = await wallet.getDocumentsFromEncryptedWallet(
      encryptedJSONWallet,
      password,
    );

    // TODO: Will implement a network check for did:dock here, there is a jira for it already

    const docs = rawDocs.map(rawDoc => {
      if (Array.isArray(rawDoc.type) && rawDoc.type.length > 0) {
        return {
          ...rawDoc,
          type: rawDoc.type[0],
        };
      }
      return rawDoc;
    });

    for (const doc of docs) {
      const existingDocs = await wallet.query({
        id: doc.id,
      });

      if (existingDocs.length === 0) {
        await wallet.addDocument(doc);
      } else if (
        existingDocs.length > 0 &&
        existingDocs[0].type === 'DIDResolutionResponse'
      ) {
        throw new Error('DID already exists in wallet');
      }
    }
    return docs;
  } catch (e) {
    switch (e.message) {
      case 'No matching recipient found for key agreement key.':
        throw new Error('Incorrect password');
      default:
        throw e;
    }
  }
}

async function editDID({wallet, id, name}){
  if (typeof id === 'string' && id.length > 0) {
    const docs = await wallet.query({
      id,
    });
    if (docs.length === 1) {
      const doc = docs[0];
      await wallet.update({
        ...doc,
        name,
      });
    }
  } else {
    throw new Error('Document ID is not set');
  }
};

async function deleteDID({wallet, id}){
  if (typeof id === 'string' && id.length > 0) {
    return await wallet.remove(id);
  } else {
    throw Error('Document ID is not set');
  }
}

async function exportDID({wallet, id, password }){
  const existingDoc = await wallet.getDocumentById(id);
  if (existingDoc) {
    const allCorrelationDocuments = (
      await wallet.resolveCorrelations(id)
    ).filter(doc => doc && doc?.id !== existingDoc.id);
    const documentsToExport = [existingDoc, ...allCorrelationDocuments];

    if (allCorrelationDocuments.length >= 1) {
      return wallet.exportDocuments({
        documents: documentsToExport,
        password,
      });
    }
    throw new Error('DID KeyPair not found');
  }

  throw new Error('DID Document not found');
}

export const createDIDKeyDocument = async (
  keypairDoc: any,
  didDocParams: any = {},
) => {
  const keypairDocCorrelations = Array.isArray(keypairDoc.correlation)
    ? keypairDoc.correlation
    : [];

  const {didDocument} = await didServiceRPC.keypairToDIDKeyDocument({
    keypairDoc: keypairDoc,
  });

  const didDocumentResolution = await didServiceRPC.getDIDResolution({
    didDocumentCustomProp: didDocParams,
    didDocument,
  } as any);

  didDocumentResolution.correlation.push(keypairDoc.id);

  keypairDocCorrelations.push(didDocumentResolution.id);

  return {
    didDocumentResolution,
    keypairDoc,
  };
};

export async function createDIDKey({wallet, name, derivePath=undefined, type=undefined}) {
  assert(!!wallet, 'wallet is required');
  assert(!!name, 'name is required');

  const keyDoc = await didServiceRPC.generateKeyDoc({derivePath, type});

  const {didDocumentResolution} = await createDIDKeyDocument(keyDoc, {
    name,
  });

  await wallet.addDocument(keyDoc);
  await wallet.addDocument(didDocumentResolution);

  return {
    keyDoc,
    didDocumentResolution,
  };
}

/**
 * Get DIDs list
 *
 * @param param0
 * @returns
 */
export async function getAll({wallet}) {
  assert(!!wallet, 'wallet is required');
  const dids = await wallet.getDocumentsByType('DIDResolutionResponse');
  return dids;
}

export async function getDefaultDID({wallet}) {
  assert(!!wallet, 'wallet is required');
  const allDids = await getAll({ wallet });
  return allDids[0]?.didDocument.id;
}

export async function getDIDKeyPairs({wallet}) {
  assert(!!wallet, 'wallet is required');
  const didDocs = await getAll({wallet});
  const keyPairs = [];
  for (const didDoc of didDocs) {
    const keyPair = await wallet.getDocumentById(didDoc.correlation[0]);
    keyPairs.push(keyPair);
  }
  return keyPairs;
}

export async function ensureDID({wallet}) {
  assert(!!wallet, 'wallet is required');
  const dids = await getAll({wallet});
  if (dids.length === 0) {
    return createDIDKey({wallet, name: 'Default DID'});
  }
}

export interface IDIDProvider {
  importDID(params: {
    encryptedJSONWallet: any;
    password: string;
  }): Promise<void>;
  createDIDKey(params: {name: string, derivePath?:string, type?: string}): Promise<any>;
  editDID(params: {id: string; name: string}): Promise<void>;
  deleteDID(params: {id: string;}): Promise<void>;
  exportDID(params: {id: string; password: string}): Promise<void>;
  getAll(): Promise<any>;
  getDIDKeyPairs(): Promise<any>;
  ensureDID(): Promise<any>;
  getDefaultDID(): Promise<string>;
}

export function createDIDProvider({wallet}): IDIDProvider {
  return {
    async importDID({encryptedJSONWallet, password}) {
      return importDID({wallet, encryptedJSONWallet, password});
    },
    async createDIDKey({name, derivePath, type}) {
      return createDIDKey({wallet, name, derivePath, type});
    },
    async editDID(params) {
      return editDID({wallet, ...params});
    },
    async deleteDID(params) {
      return deleteDID({wallet, ...params});
    },
    async exportDID(params) {
      return exportDID({wallet, ...params});
    },
    async getAll() {
      return getAll({wallet});
    },
    async getDIDKeyPairs() {
      return getDIDKeyPairs({wallet});
    },
    async ensureDID() {
      return ensureDID({wallet});
    },
    async getDefaultDID() {
      return getDefaultDID({wallet});
    }
  };
}
