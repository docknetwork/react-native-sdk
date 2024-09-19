import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  Relation,
} from '../../typeorm';
import {DocumentTypeEntity} from '../document-type.entity';

@Entity()
export class DocumentEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', {
    nullable: true,
  })
  networkId: string;

  @Column('simple-array')
  type: string[];

  @ManyToMany(() => DocumentTypeEntity, type => type?.documents, {
    cascade: ['insert'],
    eager: true,
    nullable: true,
  })
  @JoinTable()
  _typeRel: Relation<DocumentTypeEntity[]>;

  // Add the ManyToMany self-referencing relationship to track document correlations
  // @ManyToMany(() => DocumentEntity, {cascade: true, nullable: true})
  // @JoinTable()
  @Column('simple-array')
  correlation: string[];

  @Column('blob')
  data: string;
}
