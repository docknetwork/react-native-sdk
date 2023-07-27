import {Account, TokenPrice, RequestLog} from './realm-schemas';

let Realm;
let realm;

const schema = [TokenPrice, Account, RequestLog];

/**
 *
 * Realm is being used by the dock-app
 * We plan to replace it with typeorm in the future
 * Its only being used for storing transactions cache for testnet wallets
 *
 */
export function setRealmInstance(_Realm) {
  Realm = _Realm;
}

export function addSchema(item) {
  schema.push(item);
}

export function getSchemas() {
  return schema;
}

export async function initRealm() {
  if (realm) {
    return realm;
  }

  if (!Realm) {
    return null;
  }

  const inMemory = process.env.NODE_ENV === 'test';

  try {
    realm = await Realm.open({
      path: 'dock',
      schema,
      schemaVersion: 3,
      deleteRealmIfMigrationNeeded: true,
      inMemory,
      // migration: () => {
      //   // No migration required so far
      // },
    });
  } catch (err) {
    console.error(err);
  }

  return realm;
}

export function clearCacheData() {
  try {
    realm.write(() => {
      realm.delete(realm.objects('Transaction'));
    });
  } catch (err) {
    console.error(err);
  }

  try {
    realm.write(() => {
      realm.delete(realm.objects('Account'));
    });
  } catch (err) {
    console.error(err);
  }
}

export function getRealm(): Realm {
  if (!realm) {
    throw new Error('realm not defined');
  }

  return realm;
}

export function setRealm(r) {
  realm = r;
}
