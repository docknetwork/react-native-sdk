import {ContextProps, WalletDocument} from '@docknetwork/wallet-sdk-data-store/src/types';
import {toWalletDocument} from './helpers';
import {DocumentEntity} from './document.entity';
import {In} from 'typeorm';
import { getDataSource } from '../../helpers';

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
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);

  const entity = await repository.findOne({
    where: {
      id: id,
      networkId: dataStore.networkId,
    },
  });

  return toWalletDocument(entity);
}

export async function getDocumentsById({
  dataStore,
  idList,
}: ContextProps & {
  idList: string[];
}): Promise<WalletDocument> {
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);

  const entities = await repository.find({
    where: {
      id: In(idList),
      networkId: dataStore.networkId,
    },
  });

  return entities.map(toWalletDocument);
}
