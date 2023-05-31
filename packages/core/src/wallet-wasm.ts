import {keyringService} from '@docknetwork/wallet-sdk-wasm/lib/services/keyring';
import {utilCryptoService} from '@docknetwork/wallet-sdk-wasm/lib/services/util-crypto';
import {dockService} from '@docknetwork/wallet-sdk-wasm/lib/services/dock';

import {IWallet} from './types';
import {Network} from '@docknetwork/wallet-sdk-data-store/src/types';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';

function isSubstrateNetwork(network: Network) {
  return !!network.configs.substrateUrl;
}

/**
 * Update existing substrate network connection
 * Compare connected substrate connection with the current walle network
 * Disconnect and Establish a new connection if the network is different
 */
export async function handleSubstrateNetworkChange(
  wallet: IWallet,
): Promise<void> {
  const currentSubstrateAddress = await dockService.getAddress();
  const substrateNetworkId = wallet.dataStore.networks.find(
    network => network.configs.substrateUrl === currentSubstrateAddress,
  )?.id;
  const currentNetworkId = wallet.dataStore.network?.id;

  if (substrateNetworkId === currentNetworkId) {
    return;
  }

  await dockService.disconnect();
  await setSubstrateNetwork(wallet);
}

export async function setSubstrateNetwork(wallet: IWallet) {
  const network = wallet.dataStore.network;
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

export async function initWalletWasm(wallet: IWallet) {
  await utilCryptoService.cryptoWaitReady();
  const network = wallet.dataStore.network;

  if (isSubstrateNetwork(network)) {
    await setSubstrateNetwork(wallet);

    wallet.eventManager.on(WalletEvents.networkUpdated, async () => {
      handleSubstrateNetworkChange(wallet);
    });
  }

  wallet.setStatus('ready');

  wallet.eventManager.emit(WalletEvents.ready);
}
