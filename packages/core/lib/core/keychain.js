import * as RNKeychain from 'react-native-keychain';

export const Keychain = {
  ...RNKeychain,
  setItem(id, data, options = {}) {
    const jsonData = JSON.stringify(data);

    options.service = id;

    return RNKeychain.setGenericPassword(
      jsonData,
      data.password || '',
      options,
    );
  },
  removeItem(id) {
    return RNKeychain.resetGenericPassword({
      service: id,
    });
  },
  async getItem(id, options = {}) {
    const result = await RNKeychain.getGenericPassword({
      service: id,
      ...options,
    });

    if (!result) {
      return;
    }

    const data = JSON.parse(result.username);

    return data;
  },
};
