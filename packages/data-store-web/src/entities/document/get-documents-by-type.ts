import {
  ContextProps,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {getAllDocuments} from './get-all-documents';

/**
 * Get documents by type
 * @param dataStore
 * @param type
 */
export async function getDocumentsByType({
  dataStore,
  type,
}: ContextProps & {
  type: string;
}): Promise<WalletDocument[]> {
  const allDocs = await getAllDocuments({dataStore, allNetworks: false});

  return allDocs.filter(doc => doc.type === type || doc.type.includes(type));
}
