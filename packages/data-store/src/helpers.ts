import {DataSource} from './typeorm';
// import {SDKConfigsEntity} from './entities/data-store-configs.entity';
import {logger} from './logger';
import {DataStoreConfigs} from './types';
import {NetworkEntity} from './entities/network.entity';
import {DocumentEntity} from './entities/document/document.entity';
import {DocumentTypeEntity} from './entities/document-type.entity';
import {WalletEntity} from './entities/wallet.entity';
import typeOrmMigrations from './migrations';
import { LogEntity } from './entities/log.entity';
import { TransactionEntity } from './entities/transaction.entity';

export function documentHasType(document: any, type: string) {
  if (Array.isArray(document.type)) {
    return document.type.includes(type);
  }

  return document.type === type;
}

export function getDataSource(options: DataStoreConfigs) {
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
  const dataSource = getDataSource(options);

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
