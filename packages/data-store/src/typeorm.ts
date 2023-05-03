import {DataSource} from 'typeorm';
// import {SDKConfigsEntity} from './entities/data-store-configs.entity';
import {logger} from './logger';
import {DataStoreConfigs} from './types';
import {NetworkEntity} from './entities/network.entity';
import {DocumentEntity} from './entities/document/document.entity';
import {DocumentTypeEntity} from './entities/document-type.entity';
import {WalletEntity} from './entities/wallet.entity';

export async function initializeTypeORM(options: DataStoreConfigs) {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: options.databasePath,
    entities: [WalletEntity, NetworkEntity, DocumentEntity, DocumentTypeEntity],
    // TODO: will remove this once we have all entities in place
    synchronize: true,
    dropSchema: options.dropSchema,
  });

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
