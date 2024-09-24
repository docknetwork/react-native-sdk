import {
  ContextProps,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {toDocumentEntity} from './helpers';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {localStorageJSON} from '../../localStorageJSON';

/**
 * Update document
 * @param dataStore
 * @param document
 */
export async function updateDocument({
  dataStore,
  document,
}: ContextProps & {
  document: WalletDocument;
  options?: any;
}): Promise<WalletDocument> {
  logger.debug(`Updating document with id ${document.id}`);

  const allDocs = (await localStorageJSON.getItem('documents')) || [];
  const index = allDocs.findIndex(doc => doc.id === document.id);

  allDocs[index] = await toDocumentEntity({
    dataStore,
    document,
  });

  await localStorageJSON.setItem('documents', allDocs);

  dataStore.events.emit('DocumentUpdated', document);

  return document;
}
