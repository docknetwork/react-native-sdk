// @ts-nocheck
export class StorageService {
  rpcMethods = [
    StorageService.prototype.setItem,
    StorageService.prototype.getItem,
    StorageService.prototype.removeItem,
    StorageService.prototype.getAllKeys,
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

  getAllKeys(): Promise<string[]> {
    return Promise.resolve(Object.keys(global.localStorage));
  }
}

export const storageService: StorageService = new StorageService();
