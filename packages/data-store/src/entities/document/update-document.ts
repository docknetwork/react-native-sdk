import { ContextProps, WalletDocument } from '../../types';
import { saveOptions, toDocumentEntity } from './helpers';
import { DocumentEntity } from './document.entity';

/**
 * Update document
 * @param dataStore
 * @param document
 */
export async function updateDocument({
  dataStore,
  document,
}: ContextProps & {document: WalletDocument}): Promise<WalletDocument> {
  return dataStore.db.transaction(async transactionalEntityManager => {
    const repository = transactionalEntityManager.getRepository(DocumentEntity);
    const entity = await toDocumentEntity({
      dataStore,
      document,
    });
    await repository.save(entity, saveOptions);

    return document;
  });
}
