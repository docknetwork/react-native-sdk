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

let connectionInProgress = false;

export default {
  name: 'dock',
  routes: {
    async init(params) {
      assert(!!params.address, 'invalid substrate address');
      assert(!connectionInProgress, 'there is a connection in progress');
      assert(!isDockReady, 'dock is already initialized');

      connectionInProgress = true;

      const result = await dock.init(params).finally(() => {
        connectionInProgress = false;
      });
      isDockReady = true;
      return result;
    },
    async disconnect() {
      const result = await dock.disconnect();
      isDockReady = false;
      connectionInProgress = false;
      return result;
    },
    async isApiConnected(...params) {
      return isDockReady;
    },
  },
};
