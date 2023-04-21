import {Entity, Column, PrimaryGeneratedColumn, PrimaryColumn} from 'typeorm';

@Entity()
export class WalletEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  networkId: string;
}
