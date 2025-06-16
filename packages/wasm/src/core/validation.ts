// @ts-nocheck
import assert from 'assert';
import {KeypairTypes} from '../types';

export {assert};

export function isNumberValid(v: any) {
  return typeof v === 'number' && !isNaN(v);
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

