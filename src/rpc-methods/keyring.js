import Keyring from "@polkadot/keyring";
import { generateMethods } from "../rpc-util";

let keyring;
let currentPairIdx = 0;

export const getCurrentPair = () => keyring.pairs[currentPairIdx];

export default [
  ...generateMethods({
    parent: "keyring",
    methodList: [
      function create(options) {
        keyring = new Keyring(options);
      },
      function addFromMnemonic(...args) {
        const pair = keyring.addFromMnemonic(...args);
        currentPairIdx = keyring.pairs.length - 1;
        return pair;
      },
      function addFromJson(...args) {
        const pair = keyring.addFromJson(...args);
        currentPairIdx = keyring.pairs.length - 1;
        return pair;
      }
    ],
  }),
  ...generateMethods({
    parent: "pair",
    methodList: [
      function setCurrent(index) {
        currentPairIdx = index;
      },
      function address() {
        return getCurrentPair().address;
      },
      function isLocked() {
        return getCurrentPair().isLocked;
      },
      function lock() {
        return getCurrentPair().lock();
      },
      function unlock(...params) {
        return getCurrentPair().unlock(...params);
      },
      function toJson(password) {
        return getCurrentPair().toJson(password);
      }
    ],
  })
]