import {createDataSource} from './helpers';

export default createDataSource({
  dbType: 'sqlite',
  databasePath: 'data-store.sqlite',
});
