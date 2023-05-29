import {Entity, Column, PrimaryGeneratedColumn, PrimaryColumn} from 'typeorm';
import {ContextProps} from '../types';

@Entity()
export class WalletEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    nullable: true,
  })
  version?: string;

  @Column()
  networkId: string;
}

export async function getWallet({
  dataStore,
}: ContextProps): Promise<WalletEntity> {
  const result = await dataStore.db.getRepository(WalletEntity).find();
  return result[0];
}

export function createWallet({dataStore}: ContextProps): Promise<WalletEntity> {
  return dataStore.db.getRepository(WalletEntity).save({
    id: 'configs',
    ...dataStore,
  });
}

export function updateWallet({dataStore}: ContextProps): Promise<WalletEntity> {
  return dataStore.db.getRepository(WalletEntity).save({
    id: 'configs',
    ...dataStore,
  });
}
