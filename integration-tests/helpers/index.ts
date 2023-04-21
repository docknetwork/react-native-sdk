import {mockDockService} from '@docknetwork/wallet-sdk-core/lib/services/test-utils';
import {DataStoreSnapshotV1} from '../data/data-store';

export async function setupEnvironent() {
  await mockDockService();
}
export function cleanup() {
  global.localStorage.removeItem('wallet');
}

export * from './account-helpers';
export * from './wallet-helpers';
