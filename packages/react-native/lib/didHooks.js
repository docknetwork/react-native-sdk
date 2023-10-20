import { useCallback, useMemo } from 'react';
import { didServiceRPC } from '@docknetwork/wallet-sdk-wasm/src/services/dids';
import { createDIDKeyDocument, createDIDProvider } from '@docknetwork/wallet-sdk-core/src/did-provider';
import { useWallet } from './index';

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

  const createDID = async didParams => {
    const { derivePath, type = 'ed25519', name, didType, address } = didParams;
    switch (didType) {
      case 'diddock':
        return didProvider.createDIDock({ address, name });
      case 'didkey':
        return didProvider.createDidKey({ derivePath, name, type });
      default:
        throw Error('Invalid DID type');
    }
  };

  return {
    importDID: didProvider.importDID,
    didProvider,
    createDID,
    editDID: didProvider.editDID,
    deleteDID: didProvider.deleteDID,
    didList,
    exportDID: didProvider.exportDID,
  };
}
