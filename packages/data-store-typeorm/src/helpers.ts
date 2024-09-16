import {DataSource} from './typeorm';
import {logger} from './logger';
import {DataStore, DataStoreConfigs} from '@docknetwork/wallet-sdk-data-store/src/types';
import {NetworkEntity} from './entities/network.entity';
import {DocumentEntity} from './entities/document/document.entity';
import {DocumentTypeEntity} from './entities/document-type.entity';
import {WalletEntity} from './entities/wallet.entity';
import typeOrmMigrations from './migrations';


export function createDataSource(options: DataStoreConfigs) {
  const dataSource = new DataSource({
    type: (options.dbType as any) || 'sqlite',
    database: options.databasePath,
    entities: [WalletEntity, NetworkEntity, DocumentEntity, DocumentTypeEntity],
    synchronize: process.env.NODE_ENV === 'test',
    dropSchema: options.dropSchema,
    driver: options.driver,
    sqlJsConfig: options.sqlJsConfig,
    migrationsRun: process.env.NODE_ENV !== 'test',
    migrations: typeOrmMigrations,
    ...(options.typeORMConfigs || {}),
  });

  return dataSource;
}

export async function initializeTypeORM(options: DataStoreConfigs) {
  const dataSource = createDataSource(options);

  await dataSource
    .initialize()
    .then(() => {
      logger.debug('Data Source initialized successfully');
    })
    .catch(err => {
      logger.error(`Error during Data Source initialization: ${err}`);
      throw err;
    });

  return dataSource;
}

export function getDataSource(dataStore: DataStore): DataSource {
  return dataStore.db as any as DataSource;
}
