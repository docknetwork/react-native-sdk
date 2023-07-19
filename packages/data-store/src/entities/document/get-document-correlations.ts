import {ContextProps, WalletDocument} from '../../types';
import {DocumentEntity} from './document.entity';
import {In} from '../../typeorm';
import {toWalletDocument} from './helpers';

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
    where: {
      id: documentId,
      networkId: dataStore.networkId,
    },
  });

  const data = await repository.find({
    where: {
      id: In(entity.correlation),
      networkId: dataStore.networkId,
    },
  });

  return data.map(toWalletDocument);
}
