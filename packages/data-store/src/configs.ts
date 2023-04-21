import {DataStoreConfigs, SDKConfigs} from './types/types';
import {getDataSource} from './typeorm';
import {SDKConfigsEntity} from './typeorm/entities/sdk-configs.entity';

export async function getSDKConfigs(
  options: DataStoreConfigs,
): Promise<SDKConfigs> {
  let result = await getDataSource().getRepository(SDKConfigsEntity).find();

  if (result.length === 1) {
    return result[0];
  }

  if (result.length > 1) {
    throw new Error('More than one SDKConfigsEntity found');
  }

  const sdkConfigs = {
    id: 'sdk-configs',
    activeWallet: options.sdkConfigs.activeWallet,
    version: null,
  };

  await getDataSource().getRepository(SDKConfigsEntity).save(sdkConfigs);

  return sdkConfigs;
}

export const defaultDataStoreConfigs: DataStoreConfigs = {
  sdkConfigs: {
    activeWallet: 'mainnet',
  },
  networks: [
    {
      name: 'Mainnet',
      id: 'mainnet',
    },
    {
      name: 'Testnet',
      id: 'testnet',
    },
  ],
  wallets: [
    {
      name: 'Mainnet',
      id: 'mainnet',
      network: 'mainnet',
    },
    {
      name: 'Testnet',
      id: 'testnet',
      network: 'testnet',
    },
  ],
};

let _activeWalletId;

export async function getActiveWallet() {
  if (!_activeWalletId) {
    _activeWalletId = await getSDKConfigs(defaultDataStoreConfigs).then(
      data => data.activeWallet,
    );
  }

  return _activeWalletId;
}

export async function setActiveWallet(walletId) {
  const configs = await getSDKConfigs(defaultDataStoreConfigs);
  configs.activeWallet = walletId;
  await getDataSource().getRepository(SDKConfigsEntity).save(configs);
  _activeWalletId = walletId;
}
