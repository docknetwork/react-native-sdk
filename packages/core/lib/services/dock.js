import assert from 'assert';
import {DockAPI} from '@docknetwork/sdk';
import {getCurrentPair} from './keyring';

let isDockReady = false;

export const dock = new DockAPI();

// TODO: Replace setTimeout by event emitter
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
    async init(params) {
      assert(!!params.address, 'address is required');
      const result = await dock.init(params);
      isDockReady = true;
      return result;
    },
    async disconnect() {
      const result = await dock.disconnect();
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
