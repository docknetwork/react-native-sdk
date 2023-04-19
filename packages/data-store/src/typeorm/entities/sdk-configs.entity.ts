import {Entity, Column, PrimaryGeneratedColumn, PrimaryColumn} from 'typeorm';

@Entity()
export class SDKConfigsEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    nullable: true,
  })
  version?: string;

  /**
   * The active network id
   */
  @Column()
  activeWallet: string;
}
