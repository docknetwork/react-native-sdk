import Keyring from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';

let keyring: Keyring;
let currentPairIdx = 0;

export const getCurrentPair = () => keyring.pairs[currentPairIdx];
export const setCurrentPairIdx = idx => {
  currentPairIdx = idx;
};
export const getKeyring = (): Keyring => {
  if (!keyring) {
    keyring = new Keyring();
  }

  return keyring;
};

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

export function getKeyringPair({
  mnemonic,
  keyPairType,
  derivePath = '',
}): KeyringPair {
  console.log(mnemonic);

  return keyring.createFromUri(
    `${mnemonic.trim()}${derivePath}`,
    {},
    keyPairType,
  );
}

export function addressFromUri({mnemonic, keyPairType, derivePath}) {
  return getKeyringPair({mnemonic, keyPairType, derivePath}).address;
}

export default {
  name: 'keyring',
  routes: {
    addFromJson,
    addFromMnemonic,
    addressFromUri,
    initialize,
  },
};
