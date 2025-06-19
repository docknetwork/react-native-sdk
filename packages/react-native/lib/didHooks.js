import { useMemo } from 'react';
import { useWallet } from './index';
import { getDIDProvider } from './wallet';

export function useDIDManagement() {
  const { documents } = useWallet();
  const didProvider = getDIDProvider();

  const didList = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents.filter(doc => {
        return doc.type === 'DIDResolutionResponse';
      });
    }
    return [];
  }, [documents]);

  const createDID = async didParams => {
    const { derivePath, type = 'ed25519', name, didType } = didParams;
    switch (didType) {
      case 'didkey':
        return didProvider.createDIDKey({ derivePath, name, type });
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
