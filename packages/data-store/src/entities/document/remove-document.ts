import assert from 'assert';
import {ContextProps} from '../../types';
import {DocumentEntity} from './document.entity';
import { logger } from '../../logger';

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

  logger.debug(`Removing document with id ${id}`);
  const repository = dataStore.db.getRepository(DocumentEntity);
  await repository.delete({
    id,
    networkId: dataStore.networkId,
  });
}

/**
 * Remove all documents
 * @param dataStore
 */
export async function removeAllDocuments({
  dataStore,
}: ContextProps): Promise<void> {
  const repository = dataStore.db.getRepository(DocumentEntity);
  await repository.delete({});
}
