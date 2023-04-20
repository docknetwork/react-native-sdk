import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  Relation,
} from 'typeorm';
import assert from 'assert';
import {getDataSource} from '../index';
import {DocumentTypeEntity} from './document-type.entity';
import {logger} from '../../logger';
import {getActiveWallet} from '../../configs';

@Entity()
export class DocumentEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', {
    nullable: true,
  })
  walletId: string;

  // TODO: check if that's required, information already available on data
  @Column('simple-array')
  type: string[];

  @ManyToMany(() => DocumentTypeEntity, type => type?.documents, {
    cascade: ['insert'],
    eager: true,
    nullable: true,
  })
  @JoinTable()
  _typeRel: Relation<DocumentTypeEntity[]>;

  @Column('blob')
  data: string;
}

export async function getOrCreateDocumentTypes(
  types: string | string[],
): Promise<DocumentTypeEntity[]> {
  assert(!!types, 'Document type must be provided');

  logger.debug(`getOrCreateDocumentTypes: ${JSON.stringify(types)}`);

  if (!Array.isArray(types)) {
    types = [types];
  }

  const typeRepository = getDataSource().getRepository(DocumentTypeEntity);
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

export async function createDocument(json: any): Promise<DocumentEntity> {
  assert(!!json.id, 'Document must have an id');

  // TODO: get walletId from context
  const walletId = await getActiveWallet();

  // TODO: Check if document exists
  const existingDocument = await getDocumentById(json.id);

  if (existingDocument) {
    throw new Error(`Document with id ${json.id} already exists`);
  }

  const _typeRel = await getOrCreateDocumentTypes(json.type);
  const entity = {
    walletId: walletId,
    id: json.id,
    type: json.type,
    _typeRel,
    data: JSON.stringify(json),
  };

  const repository = getDataSource().getRepository(DocumentEntity);

  return repository.save(entity);
}

export async function getDocumentById(id: string): Promise<DocumentEntity> {
  const repository = getDataSource().getRepository(DocumentEntity);
  const walletId = await getActiveWallet();

  return repository.findOne({
    where: {
      id: id,
      walletId,
    },
  });
}

export async function getDocumentsByType(
  type: string,
): Promise<DocumentEntity[]> {
  const repository = getDataSource().getRepository(DocumentEntity);
  const walletId = await getActiveWallet();

  // TODO: Implement this
  throw new Error('Not implemented');
}
