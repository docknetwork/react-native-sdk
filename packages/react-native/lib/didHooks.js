import {useCallback, useMemo} from 'react';
import {didServiceRPC} from '@docknetwork/wallet-sdk-wasm/lib/services/dids';
import {createDIDProvider} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {useWallet} from './index';

// TODO: there is no point in using hooks here
// we could just use a regular function and createDIDKeypairDocument looks redundant
export function useDIDUtils() {
  const createDIDKeypairDocument = useCallback(async keypairParams => {
    const {type, derivePath} = keypairParams;
    return didServiceRPC.generateKeyDoc({
      type,
      derivePath,
      controller: keypairParams.controller,
    });
  }, []);

  const createDIDDockKeyDoc = useCallback(
    ({keypairId, controller, keyPairJSON}) => {
      return didServiceRPC.generateDIDDockKeyDoc({
        keypairId,
        keyPairJSON,
        controller,
      });
    },
    [],
  );

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
  const didProvider = useMemo(() => {
    return createDIDProvider({
      wallet,
    });
  }, [wallet]);
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
      const keyPair = await wallet.getAccountKeyPair(address);
      const {dockDID, keyPairWalletId} = await didServiceRPC.registerDidDock(
        keyPair,
      );

      const keydoc = await createDIDDockKeyDoc({
        keypairId: keyPairWalletId,
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

  const exportDID = useCallback(
    async ({id, password}) => {
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
    },
    [wallet],
  );

  return {
    // I've moved this method to the did-provider.ts file
    // Can be used as an example on how to remove code from hooks
    importDID: didProvider.importDID,
    didProvider,
    createDID,
    editDID,
    deleteDID,
    didList,
    exportDID,
  };
}
