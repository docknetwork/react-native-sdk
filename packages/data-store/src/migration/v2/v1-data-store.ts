import assert from 'assert';

export type LocalStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

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

export async function getWalletDocument() {
  const jsonData = await _localStorage.getItem('wallet');

  if (!jsonData) {
    return [];
  }

  const wallet = JSON.parse(jsonData as string);

  return Object.keys(wallet).map(key => {
    return wallet[key];
  });
}
