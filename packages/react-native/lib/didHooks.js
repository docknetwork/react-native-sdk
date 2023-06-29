import {useCallback, useMemo} from 'react';
import {didServiceRPC} from '@docknetwork/wallet-sdk-wasm/lib/services/dids';

import {useWallet} from './index';
export function useDIDUtils() {
  const createDIDKeypairDocument = useCallback(async keypairParams => {
    const {type, derivePath} = keypairParams;
    return didServiceRPC.generateKeyDoc({
      type,
      derivePath,
      controller: keypairParams.controller,
    });
  }, []);

  const createDIDDockKeyDoc = useCallback(({keypairId, controller}) => {
    return didServiceRPC.generateDIDDockKeyDoc({
      keypairId,
      controller,
    });
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
      createDIDDockKeyDoc,
    };
  }, [createDIDKeypairDocument, createDIDKeyDocument, createDIDDockKeyDoc]);
}

export function useDIDManagement() {
  const {wallet, documents} = useWallet({syncDocs: true});
  const {createDIDKeypairDocument, createDIDKeyDocument, createDIDDockKeyDoc} =
    useDIDUtils();

  const didList = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents.filter(doc => {
        return doc.type === 'DIDResolutionResponse';
      });
    }
    return [];
  }, [documents]);

  const didMethodKey = useCallback(
    async ({derivePath, type, name}) => {
      const keydoc = await createDIDKeypairDocument({
        derivePath,
        type,
      });
      const {didDocumentResolution} = await createDIDKeyDocument(keydoc, {
        name,
      });
      await wallet.add(keydoc);
      await wallet.add(didDocumentResolution);
    },
    [createDIDKeyDocument, createDIDKeypairDocument, wallet],
  );

  const didMethodDock = useCallback(
    async ({address, name}) => {
      const {dockDID, keyPairWalletId} = await didServiceRPC.registerDidDock(
        address,
      );

      const keydoc = await createDIDDockKeyDoc({
        keypairId: keyPairWalletId,
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
    },
    [createDIDDockKeyDoc, wallet],
  );

  const createDID = useCallback(
    async didParams => {
      const {derivePath, type = 'ed25519', name, didType, address} = didParams;
      switch (didType) {
        case 'diddock':
          return didMethodDock({address, name, derivePath, type});
        case 'didkey':
          return didMethodKey({derivePath, name, type});
        default:
          throw Error('Invalid DID type');
      }
    },
    [didMethodDock, didMethodKey],
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
    },
    [wallet],
  );

  const exportDID = useCallback(
    async ({id, password}) => {
      const existingDoc = await wallet.getDocumentById(id);
      if (existingDoc) {
        const allCorrelationDocuments = (await wallet.resolveCorrelations(id)).filter(doc => doc && doc?.id !== existingDoc.id);
        const documentsToExport = [
          existingDoc,
          ...allCorrelationDocuments,
        ];

        if (allCorrelationDocuments.length >= 1) {
          return wallet.exportDocuments({
            documents: documentsToExport,
            password,
          });
        }
        throw new Error('DID KeyPair not found');
      }

      throw new Error('DID Document not found');
    },
    [wallet],
  );

  return useMemo(() => {
    return {
      createDID,
      editDID,
      deleteDID,
      didList,
      importDID,
      exportDID,
    };
  }, [createDID, editDID, deleteDID, didList, importDID, exportDID]);
}
