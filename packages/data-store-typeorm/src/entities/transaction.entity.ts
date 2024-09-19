import { Entity, Column, PrimaryColumn, DataSource } from 'typeorm';
import { DataStore } from '@docknetwork/wallet-sdk-data-store/src/types';
import { getDataSource } from '../helpers';

@Entity()
export class TransactionEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ default: 'transfer' })
  type: string;

  @Column({ nullable: true })
  error: string;

  @Column({ nullable: true })
  metadata: string;

  @Column()
  date: Date;

  @Column()
  fromAddress: string;

  @Column()
  recipientAddress: string;

  @Column({ nullable: true })
  amount: string;

  @Column()
  feeAmount: string;

  @Column({ default: 'testnet' })
  network: string;

  @Column()
  status: string;

  @Column({ default: false })
  retrySucceeded: boolean;
}

export async function getLogs({
  dataStore,
}: {
  dataStore: DataStore;
}): Promise<TransactionEntity[]> {
  const db = getDataSource(dataStore);
  const repository = db.getRepository(TransactionEntity);
  const entities = await repository.find({});

  return entities;
}

export async function createTransaction({
  dataStore,
  transaction,
}: {
  dataStore: DataStore;
  transaction: TransactionEntity,
}): Promise<TransactionEntity> {
  const db = getDataSource(dataStore);
  const repository = await db.getRepository(TransactionEntity);

  return repository.save(transaction);
}