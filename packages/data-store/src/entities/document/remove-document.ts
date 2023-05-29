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
  const repository = dataStore.db.getRepository(DocumentEntity);
  await repository.delete({
    id,
    networkId: dataStore.networkId,
  });
}
