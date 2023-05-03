import {ContextProps, WalletDocument} from '../../types';
import {DocumentEntity} from './document.entity';
import {createQueryBuilder} from 'typeorm';
import {toWalletDocument} from './helpers';

/**
 * Get documents by type
 * @param dataStore
 * @param type
 */
export async function getDocumentsByType({
  dataStore,
  type,
}: ContextProps & {
  type: string;
}): Promise<WalletDocument[]> {
  const repository = dataStore.db.getRepository(DocumentEntity);

  const documents = repository
    .createQueryBuilder('document')
    .leftJoinAndSelect('document._typeRel', 'documentType')
    .where('documentType.id = :type', {type});

  const result = await documents.getMany();

  return result.map(toWalletDocument);
}
