import StorageWallet from '@docknetwork/universal-wallet/storage-wallet';
import MemoryStorageInterface from './memory-storage-interface';

class MemoryWallet extends StorageWallet {
  constructor(id, storageOptions = {}) {
    // Allow user to pass pre-initialized interface or construct a default one
    const storageInterface =
      storageOptions.storageInterface || new MemoryStorageInterface(id);
    super(id, storageInterface);
  }

  async import(data, password) {
    const result = await super.import(data, password);

    this.contents.forEach(content => {
      this.promises.push(this.insertToStorage(content));
    });

    return result;
  }
}

export default MemoryWallet;
