import { ContextProps, WalletDocument } from '@docknetwork/wallet-sdk-data-store/src/types';
import { saveOptions, toDocumentEntity } from './helpers';
import { DocumentEntity } from './document.entity';
import { logger } from '../../logger';
import { getDataSource } from '../../helpers';

/**
 * Update document
 * @param dataStore
 * @param document
 */
export async function updateDocument({
  dataStore,
  document,
}: ContextProps & {document: WalletDocument, options?: any}): Promise<WalletDocument> {
  logger.debug(`Updating document with id ${document.id}`);

  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);
  const entity = await toDocumentEntity({
    dataStore,
    document,
  });
  await repository.save(entity, saveOptions);

  dataStore.events.emit('DocumentUpdated', document);

  return document;
}
