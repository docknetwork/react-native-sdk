export type StorageInterface = string;

//   setItem(key, data) {

//   }

//   getItem(key) {

//   }

//   removeItem(key) {

//   }
// }

let storage: StorageInterface;

export function setStorage(item: StorageInterface) {
  storage = item;
}

export function getStorage(): StorageInterface {
  return storage;
}
