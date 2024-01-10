import { Entity, Column, PrimaryColumn } from 'typeorm';
import { DataStore } from '../types';

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
  const repository = dataStore.db.getRepository(TransactionEntity);
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
  const repository = dataStore.db.getRepository(TransactionEntity);

  return repository.save(transaction);
}