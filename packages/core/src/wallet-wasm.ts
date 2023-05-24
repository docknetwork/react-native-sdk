import {keyringService} from '@docknetwork/wallet-sdk-wasm/lib/services/keyring';
import {utilCryptoService} from '@docknetwork/wallet-sdk-wasm/lib/services/util-crypto';
import {dockService} from '@docknetwork/wallet-sdk-wasm/lib/services/dock';

import {IWallet} from './types';
import {Network} from '@docknetwork/wallet-sdk-data-store/src/types';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';

function isSubstrateNetwork(network: Network) {
  return !!network.configs.substrateUrl;
}

export async function initWalletWasm(wallet: IWallet) {
  await utilCryptoService.cryptoWaitReady();
  const network = wallet.dataStore.network;

  if (isSubstrateNetwork(network)) {
    const networkConfigs = network.configs;
    await keyringService.initialize({
      ss58Format: networkConfigs.addressPrefix,
    });

    dockService
      .init({
        address: networkConfigs.substrateUrl,
      })
      .then(() => {
        wallet.eventManager.emit(WalletEvents.networkConnected);
      })
      .catch(err => {
        console.error(err);
        wallet.eventManager.emit(WalletEvents.networkError, err);
      });
  }

  wallet.setStatus('ready');

  wallet.eventManager.emit(WalletEvents.ready);
}
