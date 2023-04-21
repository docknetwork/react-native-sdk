import {Entity, Column, PrimaryColumn} from 'typeorm';

@Entity()
export class NetworkEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;
}
