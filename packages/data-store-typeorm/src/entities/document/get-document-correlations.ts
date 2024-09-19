import {ContextProps, WalletDocument} from '@docknetwork/wallet-sdk-data-store/src/types';
import {DocumentEntity} from './document.entity';
import {In} from '../../typeorm';
import {toWalletDocument} from './helpers';
import { getDataSource } from '../../helpers';

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
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);

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
