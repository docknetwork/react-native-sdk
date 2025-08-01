import {
  ContextProps,
  DataStoreEvents,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {v4 as uuid} from 'uuid';
import {DocumentEntity} from './document.entity';
import {getDocumentById} from './get-document-by-id';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {localStorageJSON} from '../../localStorageJSON';
import {getAllDocuments} from './get-all-documents';

export async function appendDocument(document: WalletDocument) {
  const entities = (await localStorageJSON.getItem('documents')) || [];

  await localStorageJSON.setItem('documents', [...entities, document]);
}

/**
 * Create document
 * @param dataStore
 * @param json
 */
export async function createDocument({
  dataStore,
  json,
  options,
}: ContextProps & {
  json: any;
  options?: any;
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

    networkId = resolution.networkId || dataStore.networkId;
  }

  const entity: DocumentEntity = {
    networkId,
    id: json.id,
    type: json.type,
    correlation: json.correlation || [],
    data: json,
  };

  await appendDocument(entity);

  if (!options?.stopPropagation) {
    dataStore.events.emit(DataStoreEvents.DocumentCreated, json);
  } else {
    console.log('stopPropagation is true');
  }

  logger.debug(`Document added to the wallet`);

  return entity;
}
