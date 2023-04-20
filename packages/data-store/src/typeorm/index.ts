import {DataSource} from 'typeorm';
import {SDKConfigsEntity} from './entities/sdk-configs.entity';
import {logger} from '../logger';
import {DataStoreConfigs} from '../types/types';
import {NetworkEntity} from './entities/network.entity';
import {WalletEntity} from './entities/wallet.entity';
import {DocumentEntity} from './entities/document.entity';
import {DocumentTypeEntity} from './entities/document-type.entity';

let _dataSource: DataSource;

export async function initializeTypeORM(options: DataStoreConfigs) {
  _dataSource = new DataSource({
    type: 'sqlite',
    database: options.databasePath,
    entities: [
      SDKConfigsEntity,
      NetworkEntity,
      WalletEntity,
      DocumentEntity,
      DocumentTypeEntity,
    ],
    // TODO: will remove this once we have all entities in place
    synchronize: true,
    dropSchema: options.dropSchema,
  });

  await _dataSource
    .initialize()
    .then(() => {
      logger.debug('Data Source initialized successfully');
    })
    .catch(err => {
      logger.error(`Error during Data Source initialization: ${err}`);
      throw err;
    });
}

export function getDataSource(): DataSource {
  return _dataSource;
}
