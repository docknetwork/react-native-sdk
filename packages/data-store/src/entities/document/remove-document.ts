import assert from 'assert';
import {ContextProps} from '../../types';
import {DocumentEntity} from './document.entity';

/**
 * Remove document
 * @param dataStore
 * @param id
 */
export async function removeDocument({
  dataStore,
  id,
}: ContextProps & {id: string}): Promise<void> {
  assert(!!id, 'Document id is required');

  return dataStore.db.transaction(async transactionalEntityManager => {
    const repository = transactionalEntityManager.getRepository(DocumentEntity);
    await repository.delete({
      id,
      networkId: dataStore.networkId,
    });
  });
}

/**
 * Remove all documents
 * @param dataStore
 */
export async function removeAllDocuments({
  dataStore,
}: ContextProps): Promise<void> {
  return dataStore.db.transaction(async transactionalEntityManager => {
    const repository = transactionalEntityManager.getRepository(DocumentEntity);
    await repository.delete({});
  });
}
