import {ContextProps, WalletDocument} from '@docknetwork/wallet-sdk-data-store/src/types';
import {DocumentEntity} from './document.entity';
import {createQueryBuilder} from '../../typeorm';
import {toWalletDocument} from './helpers';
import { getDataSource } from '../../helpers';

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
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);

  const documents = repository
    .createQueryBuilder('document')
    .leftJoinAndSelect('document._typeRel', 'documentType')
    .where('documentType.id = :type', {type})
    .andWhere('document.networkId = :networkId', {
      networkId: dataStore.networkId,
    });

  const result = await documents.getMany();

  return result.map(toWalletDocument);
}
