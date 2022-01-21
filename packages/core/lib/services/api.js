import dock from '@docknetwork/sdk';
import {getLogger} from '../logger';
import {ensureDockReady} from './dock';
import {getKeyring} from './keyring';
import {getWallet} from './wallet';

async function getAccountKeyring(accountAddress) {
  const accountDetails = (
    await getWallet().query({
      equals: {
        'content.id': accountAddress,
      },
    })
  )[0];
  const mnemonic = (
    await getWallet().query({
      equals: {
        'content.id':
          accountDetails.correlation && accountDetails.correlation[0],
      },
    })
  )[0];

  return getKeyring().addFromMnemonic(mnemonic.value, {}, 'sr25519');
}

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

    async getFeeAmount({recipientAddress, accountAddress, amount}) {
      const account = await getAccountKeyring(accountAddress);

      dock.setAccount(account);

      const extrinsic = dock.api.tx.balances.transfer(recipientAddress, amount);
      const paymentInfo = await extrinsic.paymentInfo(account);
      return paymentInfo.partialFee.toString();
    },

    async sendTokens({recipientAddress, accountAddress, amount}) {
      const account = await getAccountKeyring(accountAddress);
      getLogger().log('Account selected', account);
      getLogger().log('Transfer to address', recipientAddress);

      dock.setAccount(account);

      return new Promise((resolve, reject) => {
        const unsub = dock.api.tx.balances
          .transfer(recipientAddress, amount)
          .signAndSend(dock.account, result => {
            const {status} = result;

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
          })
          .catch(reject);
      });
    },
  },
};
