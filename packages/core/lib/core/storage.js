


export interface StorageInterface {
  
  setItem(key, data) {
    
  }
  
  getItem(key) {
    
  }
  
  removeItem(key) {
    
  }
}

let storage: StorageInterface;

export function setStorage(item: StorageInterface) {
    storage = item;
}

export function getStorage():StorageInterface {
  return storage;
}
