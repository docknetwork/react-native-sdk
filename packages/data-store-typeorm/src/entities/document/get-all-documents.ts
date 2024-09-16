import {WalletDocument, DataStore} from '@docknetwork/wallet-sdk-data-store/src/types';
import {toWalletDocument} from './helpers';
import {DocumentEntity} from './document.entity';
import { getDataSource } from '../../helpers';

function toWalletDocumentExpanded(entity: DocumentEntity): WalletDocument {
  const result = toWalletDocument(entity);

  if (result) {
    result['_networkId'] = entity.networkId;
  }

  return result;
}

/**
 * Get all documents
 *
 * @param dataStore
 */
export async function getAllDocuments({
  dataStore,
  allNetworks,
}: {
  dataStore: DataStore;
  allNetworks?: boolean;
}): Promise<WalletDocument[]> {
  const db = getDataSource(dataStore);
  const repository = db.getRepository(DocumentEntity);
  const entities = await repository.find({
    where: allNetworks
      ? {}
      : {
          networkId: dataStore.networkId,
        },
  });

  const mapDocument = allNetworks ? toWalletDocumentExpanded : toWalletDocument;

  return Promise.all(entities.map(mapDocument));
}
