import {Entity, Column, PrimaryColumn, ManyToMany} from '../typeorm';
import {DocumentEntity} from './document/document.entity';

@Entity()
export class DocumentTypeEntity {
  @PrimaryColumn('text')
  id: string;

  @ManyToMany(() => DocumentEntity, document => document._typeRel)
  documents: DocumentEntity[];
}
