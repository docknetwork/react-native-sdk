import {Entity, Column, PrimaryColumn} from '../typeorm';
import {ContextProps, DataStore} from '../types';

@Entity()
export class LogEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  level: string;

  @Column()
  value: string;

  @Column()
  createdAt: Date;
}

export async function getLogs({
  dataStore,
}: {
  dataStore: DataStore;
}): Promise<LogEntity[]> {
  const repository = dataStore.db.getRepository(LogEntity);
  const entities = await repository.find({
    order: {
      createdAt: 'DESC',
    },
  });

  return entities;
}

export async function createLog({
  dataStore,
  log,
}: {
  dataStore: DataStore;
  log: LogEntity,
}): Promise<LogEntity> {
  const repository = dataStore.db.getRepository(LogEntity);

  log.createdAt = new Date();

  return repository.save(log);
}
