import {ContextProps, WalletDocument} from '../../types';
import {DocumentTypeEntity} from '../document-type.entity';
import assert from 'assert';
import {logger} from '../../logger';
import {DocumentEntity} from './document.entity';
import {In} from 'typeorm';

/**
 * Get document by id
 * @param dataStore
 * @param types
 */
export async function getOrCreateDocumentTypes({
  dataStore,
  types,
}: ContextProps & {
  types: string | string[];
}): Promise<DocumentTypeEntity[]> {
  assert(!!types, 'Document type must be provided');

  logger.debug(`getOrCreateDocumentTypes: ${JSON.stringify(types)}`);

  if (!Array.isArray(types)) {
    types = [types];
  }

  const typeRepository = dataStore.db.getRepository(DocumentTypeEntity);
  const typeEntityList = [];
  for (const type of types) {
    let typeEntity = await typeRepository.findOne({
      where: {
        id: type,
      },
    });

    if (!typeEntity) {
      typeEntity = typeRepository.create({
        id: type,
      });

      await typeRepository.save(typeEntity);
    }

    typeEntityList.push(typeEntity);
  }

  return typeEntityList;
}

export async function findDocumentEntitiesById({
  dataStore,
  entityIds,
}: ContextProps & {
  entityIds: string[];
}): Promise<DocumentEntity[]> {
  assert(!!entityIds, 'Document ids must be provided');
  const repository = dataStore.db.getRepository(DocumentEntity);

  const entities = await repository.findBy({
    id: In(entityIds),
  });

  return entities;
}

/**
 * Convert document entity to wallet document
 * @param entity
 */
export function toWalletDocument(entity: DocumentEntity): WalletDocument {
  if (!entity) {
    return entity;
  }

  return {
    id: entity.id,
    type: entity.type,
    networkId: entity.networkId,
    data: JSON.parse(entity.data),
  };
}

/**
 * Convert wallet document to document entity
 * @param walletDocument
 */
export async function toDocumentEntity({
  dataStore,
  document,
}: ContextProps & {
  document: WalletDocument;
}): Promise<DocumentEntity> {
  const _typeRel = await getOrCreateDocumentTypes({
    dataStore,
    types: document.data.type,
  });

  return {
    id: document.id,
    type: document.data.type,
    data: JSON.stringify(document.data),
    _typeRel,
    correlation: document.data.correlation || [],
    networkId: document.networkId,
  } as DocumentEntity;
}
