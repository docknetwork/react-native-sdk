import dock from '@docknetwork/sdk';
import { ensureDockReady } from './dock';

export default {
  name: "api",
  routes: {
    async getAccountBalance(address) {
      await ensureDockReady();
      const { data: { free }} = await dock.api.query.system.account(address);
      return free.toHuman();
    },

    async sendTokens({ address, amount }) {
      return new Promise((resolve, reject) => {
        const unsub = dock.api.tx.balances.transfer(address, amount)
          .signAndSend(dock.account, (result) => {
            const { status } = result;
        
            if (status.isInBlock) {
              
              resolve(status.toJSON());

              unsub();
            } else if (status.isInvalid) {
              reject(new Error('Transaction status is invalid'));
            } else if (status.isDropped) {
              reject(new Error('Transaction status dropped'));
            } else if (status.isRetracted) {
              reject(new Error('Transaction status is retracted'));
            }
          }).catch(reject);
      })
    }
  },
};
