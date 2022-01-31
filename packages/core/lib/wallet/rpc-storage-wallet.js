import StorageWallet from '@docknetwork/wallet/storage-wallet';
import RpcStorageInterface from './rpc-storage-interface';

class RpcWallet extends StorageWallet {
  constructor(id, storageOptions = {}) {
    // Allow user to pass pre-initialized interface or construct a default one
    const storageInterface =
      storageOptions.storageInterface || new RpcStorageInterface(id);
    super(id, storageInterface);
  }

  async import(data, password) {
    const result = await super.import(data, password);

    // validate wallet data
    // migrate wallet data

    this.contents.forEach(content => {
      this.promises.push(this.insertToStorage(content));
    });

    return result;
  }
}

export default RpcWallet;
