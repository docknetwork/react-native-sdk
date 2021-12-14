

export type NetworkInfo = {
  name: string,
  substrateUrl: string,
  addressPrefix: number,
}

export type NetworkId = 'mainnet' | 'testnet' | 'local' | 'custom';

export const SUBSTRATE_NETWORKS = {
  mainnet: {
    name: 'Dock PoS Mainnet',
    substrateUrl: 'wss://mainnet-node.dock.io',
    addressPrefix: 22,
  },
  testnet: {
    name: 'Dock PoS Testnet',
    substrateUrl: 'wss://knox-1.dock.io',
    addressPrefix: 21,
  },
  local: {
    name: 'Local Node',
    substrateUrl: 'ws://127.0.0.1:9944',
    addressPrefix: 21,
  },
};

function getNetworkInfo(networkId): NetworkInfo {
  const networkInfo = SUBSTRATE_NETWORKS[networkId];

  if (!networkInfo) {
    throw new Error(`Network ${networkId} not found`);
  }

  return networkInfo;
}


export class NetworkManager {
  networkId: NetworkId;

  constructor() {
    this.networkId = 'mainnet';
  }

  /**
   * Set current network id
   * 
   * @param {string} networkId 
   */
  setNetworkId(networkId: NetworkId) {
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