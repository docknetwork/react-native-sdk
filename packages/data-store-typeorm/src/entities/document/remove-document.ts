import assert from 'assert';
import {
  ContextProps,
  DataStoreEvents,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {DocumentEntity} from './document.entity';
import {logger} from '../../logger';
import {getDataSource} from '../../helpers';

/**
 * Remove document
 * @param dataStore
 * @param id
 */
export async function removeDocument({
  dataStore,
  id,
  options,
}: ContextProps & {id: string; options?: any}): Promise<void> {
  assert(!!id, 'Document id is required');

  logger.debug(`Removing document with id ${id}`);
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);
  await repository.delete({
    id,
    networkId: dataStore.networkId,
  });

  dataStore.events.emit(DataStoreEvents.DocumentDeleted, id);
}

/**
 * Remove all documents
 * @param dataStore
 */
export async function removeAllDocuments({
  dataStore,
}: ContextProps): Promise<void> {
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);

  await repository
    .createQueryBuilder()
    .delete()
    .execute();

  dataStore.events.emit(DataStoreEvents.AllDocumentsDeleted);
}
