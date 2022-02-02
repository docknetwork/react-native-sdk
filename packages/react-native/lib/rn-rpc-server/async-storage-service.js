import assert from 'assert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {EventEmitter} from 'events';

export class StorageService {
  
  rpcMethods = [
    StorageService.prototype.setItem,
    StorageService.prototype.getItem,
    StorageService.prototype.removeItem,
  ];

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
}


export const storageService:StorageService = new StorageService();

