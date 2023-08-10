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

export async function createDIDock({wallet, address, name}) {
  assert(!!wallet, 'wallet is required');
  assert(!!address, 'address is required');
  assert(!!name, 'name is required');

  const keyPair = await wallet.getAccountKeyPair(address);
  const {dockDID, keyPairWalletId} = await didServiceRPC.registerDidDock(
    keyPair,
  );

  const keydoc = await didServiceRPC.generateKeyDoc({
    keyPairJSON: keyPair,
    controller: dockDID,
  });

  const didDocument = await didServiceRPC.getDidDockDocument(dockDID);

  const dockDIDResolution = {
    id: dockDID,
    type: 'DIDResolutionResponse',
    name,
    didDocument,
    correlation: [keydoc.id, keyPairWalletId],
  };

  await wallet.add(keydoc);
  await wallet.add(dockDIDResolution);
}

const createDIDKeyDocument = async (
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

export async function createDIKey({wallet, name}) {
  assert(!!wallet, 'wallet is required');
  assert(!!name, 'name is required');

  const keyDoc = await didServiceRPC.generateKeyDoc({});

  const {didDocumentResolution} = await createDIDKeyDocument(keyDoc, {
    name,
  });

  await wallet.add(keyDoc);
  await wallet.add(didDocumentResolution);

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
    return createDIKey({wallet, name: 'Default DID'});
  }
}

export interface IDIDProvider {
  importDID(params: {
    encryptedJSONWallet: any;
    password: string;
  }): Promise<void>;
  createDIDock(params: {address: string; name: string}): Promise<void>;
  createDIDKey(params: {name: string}): Promise<any>;
  getAll(): Promise<any>;
  getDIDKeyPairs(): Promise<any>;
  ensureDID(): Promise<any>;
}

export function createDIDProvider({wallet}): IDIDProvider {
  return {
    async importDID({encryptedJSONWallet, password}) {
      return importDID({wallet, encryptedJSONWallet, password});
    },
    async createDIDock({address, name}) {
      return createDIDock({wallet, address, name});
    },
    async createDIDKey({name}) {
      return createDIKey({wallet, name});
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
  };
}
