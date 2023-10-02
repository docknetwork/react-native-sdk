import {useCallback, useMemo} from 'react';
import {didServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/dids';
import {createDIDKeyDocument, createDIDProvider} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {useWallet} from './index';

export function useDIDManagement() {
  const { wallet, documents } = useWallet();
  const didProvider = useMemo(() => {
    return createDIDProvider({
      wallet,
    });
  }, [wallet]);
  const didList = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents.filter(doc => {
        return doc.type === 'DIDResolutionResponse';
      });
    }
    return [];
  }, [documents]);

  const didMethodKey = useCallback(
    async ({ derivePath, type, name }) => {
      const keydoc = await didServiceRPC.generateKeyDoc({
        type,
        derivePath,
      });
      const { didDocumentResolution } = await createDIDKeyDocument(keydoc, {
        name,
      });
      await wallet.add(keydoc);
      await wallet.add(didDocumentResolution);
    },
    [wallet],
  );

  const createDID = useCallback(
    async didParams => {
      const { derivePath, type = 'ed25519', name, didType, address } = didParams;
      switch (didType) {
        case 'diddock':
          return didProvider.createDIDock({ address, name });
        case 'didkey':
          // TODO: use the same approach as we have for DIDDock
          // move didMethodKey to didProvider, and stop using react hooks for it
          // so that it can be used with non-react apps later on (e.g: flutter, nodejs)
          return didMethodKey({ derivePath, name, type });
        default:
          throw Error('Invalid DID type');
      }
    },
    [didProvider, didMethodKey],
  );
  const editDID = useCallback(
    async didParams => {
      const { id, name } = didParams;
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
      const { id } = didParams;
      if (typeof id === 'string' && id.length > 0) {
        return await wallet.remove(id);
      } else {
        throw Error('Document ID is not set');
      }
    },
    [wallet],
  );

  const exportDID = useCallback(
    async ({ id, password }) => {
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
