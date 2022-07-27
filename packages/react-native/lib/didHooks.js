import {useCallback, useMemo} from 'react';
import {didServiceRPC} from '@docknetwork/wallet-sdk-core/lib/services/dids';
import {useWallet} from './index';
export function useDIDUtils() {
  const createDIDKeypairDocument = useCallback(async keypairParams => {
    const {type, derivePath} = keypairParams;
    return await didServiceRPC.generateKeyDoc({type, derivePath});
  }, []);

  const createDIDKeyDocument = useCallback(
    async (keypairDoc, didDocParams = {}) => {
      const keypairDocCorrelations = Array.isArray(keypairDoc.correlation)
        ? keypairDoc.correlation
        : [];

      const {didDocument} = await didServiceRPC.keypairToDIDKeyDocument({
        keypairDoc: keypairDoc,
      });

      const didDocumentResolution = await didServiceRPC.getDIDResolution({
        didDocumentCustomProp: didDocParams,
        didDocument,
      });

      didDocumentResolution.correlation.push(keypairDoc.id);

      keypairDocCorrelations.push(didDocumentResolution.id);

      return {
        didDocumentResolution,
        keypairDoc,
      };
    },
    [],
  );

  return useMemo(() => {
    return {
      createDIDKeypairDocument,
      createDIDKeyDocument,
    };
  }, [createDIDKeypairDocument, createDIDKeyDocument]);
}

export function useDIDManagement() {
  const {wallet, documents} = useWallet({syncDocs: true});
  const {createDIDKeypairDocument, createDIDKeyDocument} = useDIDUtils();

  const didList = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents.filter(doc => {
        return doc.type === 'DIDResolutionResponse';
      });
    }
    return [];
  }, [documents]);

  const createKeyDID = useCallback(
    async didParams => {
      const {derivePath, type = 'ed25519', name} = didParams;
      if (type === 'ed25519') {
        const keydoc = await createDIDKeypairDocument({derivePath, type});

        const {didDocumentResolution} = await createDIDKeyDocument(keydoc, {
          name,
        });
        await wallet.add(keydoc);
        await wallet.add(didDocumentResolution);
      } else {
        throw Error(`${type} keypair type is not supported.`);
      }
    },
    [createDIDKeyDocument, createDIDKeypairDocument, wallet],
  );
  const editDID = useCallback(
    async didParams => {
      const {id, name} = didParams;
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
    },
    [wallet],
  );
  const deleteDID = useCallback(
    async didParams => {
      const {id} = didParams;
      if (typeof id === 'string' && id.length > 0) {
        return await wallet.remove(id);
      } else {
        throw Error('Document ID is not set');
      }
    },
    [wallet],
  );

  const importDID = useCallback(
    async ({encryptedJSONWallet, password}) => {
      try {
        const rawDocs = await wallet.getDocumentsFromEncryptedWallet({
          encryptedJSONWallet,
          password,
        });
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
            await wallet.add(doc);
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
    },
    [wallet],
  );

  return useMemo(() => {
    return {
      createKeyDID,
      editDID,
      deleteDID,
      didList,
      importDID,
    };
  }, [createKeyDID, editDID, deleteDID, didList, importDID]);
}
