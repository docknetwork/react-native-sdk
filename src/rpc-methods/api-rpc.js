import dock from '@docknetwork/sdk';
import { generateMethods } from "../rpc-util";

export default generateMethods({
  parent: "api",
  methodList: [
    async function getAccountBalance(address) {
      const { data: { free: currentFree }} = await dock.api.query.system.account(address);
      return currentFree.toHuman();
    },
  ],
})

