import Keyring from "@polkadot/keyring";

let keyring;
let currentPairIdx = 0;

export const getCurrentPair = () => keyring.pairs[currentPairIdx];
export const setCurrentPairIdx = idx => {
  currentPairIdx = idx;
}
export const getKeyring = () => {
  if (!keyring) {
    keyring = new Keyring();
  }

  return keyring;
}

export function initialize(options) {
  keyring = new Keyring(options);

  return true;
}

export function addFromMnemonic(...args) {
  const pair = keyring.addFromMnemonic(...args);
  currentPairIdx = keyring.pairs.length - 1;
  return pair;
}

export function addFromJson(data, password) {
  const pair = keyring.addFromJson(data);
  currentPairIdx = keyring.pairs.length - 1;
  pair.unlock(password);
  return pair;
}

export function addressFromUri({ phrase, type, derivePath }) {
  return keyring.createFromUri(`${phrase.trim()}${derivePath}`, {}, type).address;
}

export default {
  name: 'keyring',
  routes: {
    addFromJson,
    addFromMnemonic,
    addressFromUri,
    initialize
  }
}
