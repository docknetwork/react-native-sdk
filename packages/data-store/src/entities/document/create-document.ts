import {ContextProps, WalletDocument} from '../../types';
import {v4 as uuid} from 'uuid';
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
  if (json.id) {
    const existingDocument = await getDocumentById({
      dataStore,
      id: json.id,
    });

    if (existingDocument) {
      throw new Error(`Document with id ${json.id} already exists`);
    }
  }

  const _typeRel = await getOrCreateDocumentTypes({
    dataStore,
    types: json.type,
  });

  const documentId = json.id || uuid();
  const {networkId} = await dataStore.resolveDocumentNetwork({
    document: json,
    dataStore,
  });

  const entity: DocumentEntity = {
    networkId,
    id: documentId,
    type: json.type,
    _typeRel,
    correlation: json.correlation || [],
    data: JSON.stringify(json),
  };

  const repository = dataStore.db.getRepository(DocumentEntity);

  return repository.save(entity);
}
