import Realm from 'realm';
import {Account, TokenPrice, Transaction} from './realm-schemas';

let realm;

export async function initRealm() {
  realm = await Realm.open({
    path: 'dock',
    schema: [TokenPrice, Transaction, Account],
    schemaVersion: 3,
    deleteRealmIfMigrationNeeded: false,
    migration: () => {
      // No migration required so far
    },
  });
}

export function getRealm(): Realm {
  return realm;
}
