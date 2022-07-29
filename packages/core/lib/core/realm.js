import Realm from 'realm';
import {Account, TokenPrice} from './realm-schemas';

let realm;

const schema = [TokenPrice, Account];

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

  const inMemory = process.env.NODE_ENV === 'test';

  realm = Realm.open({
    path: 'dock',
    schema,
    schemaVersion: 3,
    deleteRealmIfMigrationNeeded: true,
    inMemory,
    // migration: () => {
    //   // No migration required so far
    // },
  });

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
