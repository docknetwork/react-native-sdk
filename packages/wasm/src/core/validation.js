import BigNumber from 'bignumber.js';
import assert from 'assert';
import {KeypairTypes} from '../types';

export {assert};

export function isNumberValid(v: any) {
  if (v instanceof BigNumber) {
    return true;
  }

  return !isNaN(parseInt(v, 10));
}

export function assertKeyType(type) {
  assert(
    !!KeypairTypes.find(t => t === type),
    `Invalid keypair type ${type}. Expected one of ${KeypairTypes.join(',')}`,
  );
}

export function assertPassword(password) {
  assert(typeof password === 'string', `invalid password: ${password}`);
}

export function assertTokenAmount(amount) {
  assert(isNumberValid(amount), 'invalid token amount');
}

export function assertAddress(address, name = 'address') {
  assert(isAddressValid(address), `invalid ${name}: ${address}`);
}

export function isAddressValid(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  if (!address.trim()) {
    return false;
  }

  return true;
}
