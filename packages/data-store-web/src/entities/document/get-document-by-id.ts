import {
  ContextProps,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {getAllDocuments} from './get-all-documents';

/**
 * Get document by id
 * @param dataStore
 * @param id
 */
export async function getDocumentById({
  dataStore,
  id,
}: ContextProps & {
  id: string;
}): Promise<WalletDocument> {
  const allDocs = await getAllDocuments({dataStore, allNetworks: false});
  return allDocs.find(doc => doc.id === id);
}

export async function getDocumentsById({
  dataStore,
  idList,
}: ContextProps & {
  idList: string[];
}): Promise<WalletDocument> {
  const allDocs = await getAllDocuments({dataStore, allNetworks: false});

  return allDocs.filter(doc => idList.includes(doc.id));
}
