import StorageWallet from '@docknetwork/wallet/storage-wallet';
import MemoryStorageInterface from './memory-storage-interface';


class MemoryWallet extends StorageWallet {
  constructor(id, storageOptions = {}) {
    // Allow user to pass pre-initialized interface or construct a default one
    const storageInterface = storageOptions.storageInterface || new MemoryStorageInterface(id);
    super(id, storageInterface);
  }
}

export default MemoryWallet;
