import {ContextProps, WalletDocument} from '../../types';
import assert from 'assert';
import {DocumentEntity} from './document.entity';
import {findDocumentEntitiesById, getOrCreateDocumentTypes} from './helpers';
import {getDocumentById} from './get-document-by-id';

/**
 * Create document
 * @param dataStore
 * @param json
 */
export async function createDocument({
  dataStore,
  json,
}: ContextProps & {
  json: any;
}): Promise<WalletDocument> {
  assert(!!json.id, 'Document must have an id');

  // TODO: Check if document exists
  const existingDocument = await getDocumentById({
    dataStore,
    id: json.id,
  });

  if (existingDocument) {
    throw new Error(`Document with id ${json.id} already exists`);
  }

  const _typeRel = await getOrCreateDocumentTypes({
    dataStore,
    types: json.type,
  });

  const correlation = json.correlation?.length
    ? await findDocumentEntitiesById({
        dataStore,
        entityIds: json.correlation,
      })
    : [];

  const entity: DocumentEntity = {
    networkId: dataStore.networkId,
    id: json.id,
    type: json.type,
    _typeRel,
    correlation,
    data: JSON.stringify(json),
  };

  const repository = dataStore.db.getRepository(DocumentEntity);

  return repository.save(entity);
}
