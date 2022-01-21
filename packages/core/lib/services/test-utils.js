import {cryptoWaitReady} from '@polkadot/util-crypto';
import KeyringService from './keyring';
import WalletService from './wallet';

export async function initializeWalletService() {
  await cryptoWaitReady();
  await KeyringService.routes.initialize({
    ss58Format: 21,
  });
  await WalletService.routes.create('test-wallet', 'memory');
}
