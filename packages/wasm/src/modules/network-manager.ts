// @ts-nocheck
import assert from 'assert';

export type NetworkInfo = {
  name: string,
  substrateUrl: string | string[],
  addressPrefix: number,
  cheqdApiUrl: string,
};

export type NetworkId = 'mainnet' | 'testnet' | 'local' | 'custom';

export const SUBSTRATE_NETWORKS : Record<NetworkId, NetworkInfo> = {
  mainnet: {
    name: 'Dock PoS Mainnet',
    substrateUrl: ['wss://mainnet-node.dock.io', 'wss://mainnet-node-2.dock.io'],
    addressPrefix: 22,
    cheqdApiUrl: 'https://cheqd-mainnet-rpc.autostake.com/',
  },
  testnet: {
    name: 'Dock PoS Testnet',
    substrateUrl: 'wss://knox-1.dock.io',
    addressPrefix: 21,
    cheqdApiUrl: 'https://testnet.cheqd.docknode.io/',
  },
  local: {
    name: 'Local Node',
    substrateUrl: 'ws://127.0.0.1:9944',
    addressPrefix: 21,
  },
};

function getNetworkInfo(networkId): NetworkInfo {
  const networkInfo = SUBSTRATE_NETWORKS[networkId];

  assert(!!networkInfo, `Network ${networkId} not found`);

  return networkInfo;
}

/**
 * NetworkManager
 */
export class NetworkManager {
  networkId: NetworkId;
  isOnline: boolean;

  constructor() {
    this.networkId = 'mainnet';
    // TODO: Detect offline mode
    this.isOnline = true;
  }

  /**
   * Set current network id
   *
   * @param {string} networkId
   */
  setNetworkId(networkId: NetworkId) {
    assert(!!SUBSTRATE_NETWORKS[networkId], `invalid networkId ${networkId}`);

    this.networkId = networkId;
  }

  /**
   * Get current network info
   * @returns networkInfo
   */
  getNetworkInfo() {
    return getNetworkInfo(this.networkId);
  }

  /**
   * Set current network id
   *
   * @return {NetworkManager} substrateNetwork
   */
  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }

    return NetworkManager.instance;
  }
}
