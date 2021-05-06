import dock from '@docknetwork/sdk';
import { generateMethods } from "../rpc-util";
import { getCurrentPair } from './keyring';

export default generateMethods({
  parent: "dock",
  methodList: [
    async function init(...params) {
      return dock.init(...params);
    },
    async function setAccount() {
      return dock.setAccount(getCurrentPair());
    },
  ],
})

