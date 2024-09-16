import {getDataSource} from './helpers';

export default getDataSource({
  dbType: 'sqlite',
  databasePath: 'data-store.sqlite',
});
