import {ContextProps, WalletDocument} from '../../types';
import {DocumentEntity} from './document.entity';
import {createQueryBuilder} from 'typeorm';

/**
 * Get related documents
 * @param dataStore
 * @param type
 */
export async function getDocumentCorrelations({
  dataStore,
  documentId,
}: ContextProps & {
  documentId: string;
}): Promise<WalletDocument[]> {
  const repository = dataStore.db.getRepository(DocumentEntity);

  const entity = await repository.findOne({
    relations: {
      correlation: true,
    },
    where: {
      id: documentId,
      networkId: dataStore.networkId,
    },
  });

  return entity.correlation;
}
