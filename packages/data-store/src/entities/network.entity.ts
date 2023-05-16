import {Entity, Column, PrimaryColumn} from 'typeorm';
import {ContextProps} from '../types';

@Entity()
export class NetworkEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  configs: string;
}
