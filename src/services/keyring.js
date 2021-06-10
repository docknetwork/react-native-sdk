import Keyring from "@polkadot/keyring";

let keyring;
let currentPairIdx = 0;

export const getCurrentPair = () => keyring.pairs[currentPairIdx];
export const setCurrentPairIdx = idx => {
  currentPairIdx = idx;
}

function initialize(options) {
  keyring = new Keyring(options);

  return true;
}

function addFromMnemonic(...args) {
  const pair = keyring.addFromMnemonic(...args);
  currentPairIdx = keyring.pairs.length - 1;
  return pair;
}

function addFromJson(...args) {
  const pair = keyring.addFromJson(...args);
  currentPairIdx = keyring.pairs.length - 1;
  return pair;
}

export default {
  name: 'keyring',
  routes: [
    addFromJson,
    addFromMnemonic,
    initialize
  ]
}
