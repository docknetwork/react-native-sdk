// @ts-nocheck
export interface StorageInterface {
  setItem(key: string, item: string): Promise<void>;
  getItem(): Promise<string>;
  remoteItem(key: string): Promise<void>;
}

let storage: StorageInterface;

export function setStorage(item: StorageInterface) {
  storage = item;
}

export function getStorage(): StorageInterface {
  return storage;
}
