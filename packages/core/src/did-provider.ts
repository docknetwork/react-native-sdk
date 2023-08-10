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

export interface IDIDProvider {
  importDID(params: {
    encryptedJSONWallet: any;
    password: string;
  }): Promise<void>;
  createDIDock(params: {address: string; name: string}): Promise<void>;
}

export function createDIDProvider({wallet}): IDIDProvider {
  return {
    async importDID({encryptedJSONWallet, password}) {
      return importDID({wallet, encryptedJSONWallet, password});
    },
    async createDIDock({address, name}) {
      return createDIDock({wallet, address, name});
    },
  };
}
