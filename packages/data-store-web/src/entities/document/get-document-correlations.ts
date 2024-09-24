import {
  ContextProps,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {getAllDocuments} from './get-all-documents';

/**
 * Get related documents
 * @param dataStore
 * @param type
 */
export async function getDocumentCorrelations({
  dataStore,
  documentId,
}: ContextProps & {
  documentId: string;
}): Promise<WalletDocument[]> {
  const allDocs = await getAllDocuments({dataStore, allNetworks: false});
  const entity = allDocs.find(doc => doc.id === documentId);

  return allDocs.filter(doc => entity.correlation.includes(doc.id));
}
