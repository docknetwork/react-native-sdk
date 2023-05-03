import {WalletDocument} from '../../types';
import {toWalletDocument} from './helpers';
import {DocumentEntity} from './document.entity';

/**
 * Get all documents
 *
 * @param dataStore
 */
export async function getAllDocuments({dataStore}): Promise<WalletDocument[]> {
  const repository = dataStore.db.getRepository(DocumentEntity);
  const entities = repository.find();
  return Promise.all(entities.map(toWalletDocument));
}
