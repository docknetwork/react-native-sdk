// import {Logger} from 'src/core/logger';

export default {
  name: 'logger',
  routes: {
    async log(...params) {
      console.log(...params);
      // Logger.debug('====> Webview logger:');
      // Logger.debug(...params);
      return 'ok';
    },
  },
};
