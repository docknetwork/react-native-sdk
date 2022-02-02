import assert from 'assert';
import {EventEmitter} from 'events';

import {validation} from './configs';

export class StorageService {
  
  rpcMethods = [
    StorageService.prototype.setItem,
    StorageService.prototype.getItem,
    StorageService.prototype.removeItem,
  ];

  constructor() {
    this.name = 'storage';
  }

  setItem(...args): Promise<any> {
    return global.localStorage.setItem(...args);
  }
  
  removeItem(...args): Promise<any> {
    return global.localStorage.removeItem(...args);
  }

  getItem(...args): Promise<any> {
    return global.localStorage.getItem(...args);
  }
}


export const storageService:StorageService = new StorageService();

