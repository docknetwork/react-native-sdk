import StorageWallet from '@docknetwork/wallet/storage-wallet';
import { getLogger } from '../logger';
import RpcStorageInterface from './rpc-storage-interface';


class RpcWallet extends StorageWallet {
  constructor(id, storageOptions = {}) {
    // Allow user to pass pre-initialized interface or construct a default one
    const storageInterface = storageOptions.storageInterface || new RpcStorageInterface(id);
    super(id, storageInterface);
  }
}

export default RpcWallet;
