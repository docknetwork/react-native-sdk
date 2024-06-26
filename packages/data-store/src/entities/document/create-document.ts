import {ContextProps, WalletDocument} from '../../types';
import {v4 as uuid} from 'uuid';
import {DocumentEntity} from './document.entity';
import {getOrCreateDocumentTypes, saveOptions} from './helpers';
import {getDocumentById} from './get-document-by-id';
import {logger} from '../../logger';

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
  logger.debug(`Creating document with id ${json.id}...`);

  if (json.id) {
    const existingDocument = await getDocumentById({
      dataStore,
      id: json.id,
    });

    if (existingDocument) {
      logger.debug(`Document with id ${json.id} already exists`);
      throw new Error(`Document with id ${json.id} already exists`);
    }
  }

  const _typeRel = await getOrCreateDocumentTypes({
    dataStore,
    types: json.type,
  });

  if (!json.id) {
    json.id = uuid();
  }

  let networkId;

  if (json._networkId) {
    networkId = json._networkId;
    delete json._networkId;
  } else {
    const resolution = await dataStore.resolveDocumentNetwork({
      document: json,
      dataStore,
    });

    networkId = resolution.networkId;
  }

  const entity: DocumentEntity = {
    networkId,
    id: json.id,
    type: json.type,
    _typeRel,
    correlation: json.correlation || [],
    data: JSON.stringify(json),
  };

  const repository = dataStore.db.getRepository(DocumentEntity);

  const result = await repository.save(entity, saveOptions);

  logger.debug(`Document added to the wallet`);

  return result;
}
