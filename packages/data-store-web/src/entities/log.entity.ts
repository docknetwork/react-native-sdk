import {DataStore} from '@docknetwork/wallet-sdk-data-store/src/types';
import {localStorageJSON} from '../localStorageJSON';

export interface LogEntity {
  id: string;
  level: string;
  value: string;
  createdAt: Date;
}

export async function getLogs(): Promise<LogEntity[]> {
  return localStorageJSON.getItem('logs') || [];
}

export async function createLog({
  log,
}: {
  dataStore: DataStore;
  log: LogEntity;
}): Promise<LogEntity> {
  log.createdAt = new Date();

  const logs = await getLogs();

  return localStorageJSON.setItem('logs', [...logs, log]);
}
