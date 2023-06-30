import {IWallet} from './types';

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
        throw new Error('DID already exist in wallet');
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

export interface IDIDProvider {
  importDID(params: {
    encryptedJSONWallet: any;
    password: string;
  }): Promise<void>;
}

export function createDIDProvider({wallet}): IDIDProvider {
  return {
    async importDID({encryptedJSONWallet, password}) {
      return importDID({wallet, encryptedJSONWallet, password});
    },
  };
}
