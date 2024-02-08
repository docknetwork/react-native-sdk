import * as Keychain from 'react-native-keychain';

export const getTimestamp = () => {
  const timestamp = Date.now();
  const dateObject = new Date(timestamp);

  return dateObject.toISOString();
};

export const isBiometrySupported = async () => {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    return !!biometryType;
  } catch (error) {
    return false;
  }
};

export const saveBiometricData = async (username, password) => {
  try {
    await Keychain.setGenericPassword(username, password, {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
  } catch (error) {
    console.log('Error saving biometricId:', error.message);
  }
};

export const getBiometricData = async () => {
  try {
    return await Keychain.getGenericPassword({
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    });
  } catch (error) {
    console.log('Error retrieving credentials:', error.message);
    return null;
  }
};
