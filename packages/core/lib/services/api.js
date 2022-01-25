import {ensureDockReady, dock} from './dock';
import {getAccountKeypair} from './wallet';

export default {
  name: 'api',
  routes: {
    async getAccountBalance(address) {
      await ensureDockReady();
      const {
        data: {free},
      } = await dock.api.query.system.account(address);
      return free.toString();
    },

    async getFeeAmount({toAddress, fromAddress, amount}) {
      const account = await getAccountKeypair(fromAddress);

      dock.setAccount(account);

      const extrinsic = dock.api.tx.balances.transfer(toAddress, amount);
      const paymentInfo = await extrinsic.paymentInfo(account);
      return paymentInfo.partialFee.toString();
    },

    async sendTokens({toAddress, fromAddress, amount}) {
      const account = await getAccountKeypair(fromAddress);
      dock.setAccount(account);

      return new Promise((resolve, reject) => {
        dock.api.tx.balances
          .transfer(toAddress, amount)
          .signAndSend(account, ({status, events}) => {
            if (status.isInBlock || status.isFinalized) {
              const errors = events.filter(({event}) =>
                dock.api.events.system.ExtrinsicFailed.is(event),
              );

              errors.forEach(
                ({
                  event: {
                    data: [error, info],
                  },
                }) => {
                  if (error.isModule) {
                    // for module errors, we have the section indexed, lookup
                    const decoded = dock.api.registry.findMetaError(
                      error.asModule,
                    );
                    const {docs, method, section} = decoded;

                    reject(
                      new Error(`${section}.${method}: ${docs.join(' ')}`),
                    );
                  } else {
                    // Other, CannotLookup, BadOrigin, no extra info
                    reject(new Error(error.toString()));
                  }
                },
              );

              if (!errors.length) {
                resolve(status.toHex());
              }
            } else if (status.isInvalid) {
              reject(new Error('Transaction status is invalid'));
            } else if (status.isDropped) {
              reject(new Error('Transaction status dropped'));
            } else if (status.isRetracted) {
              reject(new Error('Transaction status is retracted'));
            }
          })
          .catch(reject);
      });
    },
  },
};
