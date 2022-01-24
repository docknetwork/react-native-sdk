import dock from '@docknetwork/sdk';
import {getLogger} from '../logger';
import {getCurrentPair} from './keyring';

let isDockReady = false;

export async function ensureDockReady() {
  if (isDockReady) {
    return;
  }

  return new Promise(resolve => {
    const checkDockReady = () => {
      if (isDockReady) {
        return resolve();
      }

      setTimeout(checkDockReady, 200);
    };

    checkDockReady();
  });
}

export default {
  name: 'dock',
  routes: {
    async init(...params) {
      getLogger().log('Attempt to init dock', params);
      const result = await dock.init(...params);
      getLogger().log('Dock sdk initialized', result);
      isDockReady = true;
      return result;
    },
    async disconnect(...params) {
      const result = await dock.disconnect(...params);
      isDockReady = false;
      return result;
    },
    async setAccount() {
      return dock.setAccount(getCurrentPair());
    },
    async isApiConnected(...params) {
      return isDockReady;
    },
  },
};
