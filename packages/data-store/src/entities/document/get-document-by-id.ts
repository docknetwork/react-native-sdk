import {ContextProps, WalletDocument} from '../../types';
import {toWalletDocument} from './helpers';
import {DocumentEntity} from './document.entity';

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
  const repository = dataStore.db.getRepository(DocumentEntity);

  const entity = await repository.findOne({
    where: {
      id: id,
      networkId: dataStore.networkId,
    },
  });

  return toWalletDocument(entity);
}
