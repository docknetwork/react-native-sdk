let _localStorage;

export const setLocalStorageImpl = (impl: any) => {
  _localStorage = impl;
};

export const localStorageJSON = {
  getItem: async (key: string) => {
    const value = await _localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  },
  setItem: async (key: string, value: any) => {
    const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
    await _localStorage.setItem(key, serializedValue);
    return value;
  },
  removeItem: (key: string) => {
    return _localStorage.removeItem(key);
  },
};
