import { getDataSource } from '../helpers';
import {Entity, Column, PrimaryColumn} from '../typeorm';
import {ContextProps} from '@docknetwork/wallet-sdk-data-store/src/types';

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
  const db = getDataSource(dataStore);
  const result = await db.getRepository(WalletEntity).find();
  return result[0];
}

export function createWallet({dataStore}: ContextProps): Promise<WalletEntity> {
  const db = getDataSource(dataStore);
  return db.getRepository(WalletEntity).save({
    id: 'configs',
    ...dataStore,
  });
}

export function updateWallet({dataStore}: ContextProps): Promise<WalletEntity> {
  const db = getDataSource(dataStore);
  return db.getRepository(WalletEntity).save({
    id: 'configs',
    ...dataStore,
  });
}
