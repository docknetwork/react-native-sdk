import assert from 'assert';
import {
  ContextProps,
  DataStoreEvents,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {DocumentEntity} from './document.entity';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import { getAllDocuments } from './get-all-documents';
import { localStorageJSON } from '../../localStorageJSON';

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
  // const db = getDataSource(dataStore);
  // const repository = db.getRepository(DocumentEntity);
  // await repository.delete({
  //   id,
  //   networkId: dataStore.networkId,
  // });

  const allDocs = await getAllDocuments({dataStore, allNetworks: true});

  const filteredDocs = allDocs.filter(doc => (doc.id !== id && doc.networkId !== dataStore.networkId));


  localStorageJSON.setItem('documents', filteredDocs);

  dataStore.events.emit(DataStoreEvents.DocumentDeleted, id);
}

/**
 * Remove all documents
 * @param dataStore
 */
export async function removeAllDocuments({
  dataStore,
}: ContextProps): Promise<void> {

  localStorageJSON.setItem('documents', []);


  dataStore.events.emit(DataStoreEvents.AllDocumentsDeleted);
}
