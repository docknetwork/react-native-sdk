import type {LocalStorage} from '@docknetwork/wallet-sdk-data-store/src/types';
import assert from 'assert';

let _localStorage: LocalStorage;

/**
 * Legacy data-store was based on AsyncLocalStorage
 * The wallet will inject its implementation here, so that the migration scripts can use it
 *
 * @param _impl
 */
export function setV1LocalStorage(_impl: LocalStorage) {
  assert(!!_impl, 'LocalStorage implementation is required');

  _localStorage = _impl;
}

export function getV1LocalStorage(): LocalStorage {
  return _localStorage;
}

export async function getWalletDocuments() {
  const jsonData = await _localStorage.getItem('wallet');

  if (!jsonData) {
    return [];
  }

  const wallet = JSON.parse(jsonData as string);

  return Object.keys(wallet).map(key => {
    return wallet[key];
  });
}
