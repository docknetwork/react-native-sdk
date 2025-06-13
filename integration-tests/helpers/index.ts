import {DataStoreSnapshotV1} from '../data/data-store';

export async function setupEnvironent() {}
export function cleanup() {
  global.localStorage.removeItem('wallet');
}

export * from './wallet-helpers';
