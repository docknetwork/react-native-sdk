import dock from "@docknetwork/sdk";
import { getLogger } from "../logger";
import { ensureDockReady } from "./dock";
import { getKeyring } from "./keyring";
import { getWallet } from "./wallet";

export default {
  name: "api",
  routes: {
    async getAccountBalance(address) {
      await ensureDockReady();
      const {
        data: { free },
      } = await dock.api.query.system.account(address);
      return free.toString();
    },

    async getFeeAmount({ recipientAddress, accountAddress, amount }) {
      return 0;
    },

    async sendTokens({ recipientAddress, accountAddress, amount }) {
      const accountDetails = (await getWallet().query({
        equals: {
          'content.id': accountAddress,
        },
      }))[0];
      const mnemonic = (await getWallet().query({
        equals: {
          'content.id': accountDetails.correlation[0],
        },
      }))[0];

      const account = getKeyring().addFromMnemonic(mnemonic.value)
      
      getLogger().log('Account selected', account);

      dock.setAccount(account);

      return new Promise((resolve, reject) => {
        const unsub = dock.api.tx.balances
          .transfer(recipientAddress, amount)
          .signAndSend(dock.account, (result) => {
            const { status } = result;

            if (status.isInBlock) {
              resolve(status.toJSON());

              unsub();
            } else if (status.isInvalid) {
              reject(new Error("Transaction status is invalid"));
            } else if (status.isDropped) {
              reject(new Error("Transaction status dropped"));
            } else if (status.isRetracted) {
              reject(new Error("Transaction status is retracted"));
            }
          })
          .catch(reject);
      });
    },
  },
};
