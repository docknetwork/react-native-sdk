import Realm from 'realm';
import {Account, TokenPrice} from './realm-schemas';

let realm;

const schema = [TokenPrice, Account];

export function addSchema(item) {
  schema.push(item);
}


export async function initRealm() {
  realm = await Realm.open({
    path: 'dock',
    schema,
    schemaVersion: 3,
    deleteRealmIfMigrationNeeded: true,
    // migration: () => {
    //   // No migration required so far
    // },
  });
}

export function getRealm(): Realm {
  return realm;
}
