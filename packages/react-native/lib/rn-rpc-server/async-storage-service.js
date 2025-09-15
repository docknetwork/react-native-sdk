import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  rpcMethods = {
    setItem: StorageService.prototype.setItem,
    getItem: StorageService.prototype.getItem,
    removeItem: StorageService.prototype.removeItem,
  };

  constructor() {
    this.name = 'storage';
  }

  setItem(key, value): Promise<any> {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(...args): Promise<any> {
    return AsyncStorage.removeItem(...args);
  }

  getItem(key): Promise<any> {
    if (!key) {
      return null;
    }

    return AsyncStorage.getItem(key);
  }

  getAllKeys(): Promise<string[]> {
    return AsyncStorage.getAllKeys();
  }
}

export const storageService: StorageService = new StorageService();
