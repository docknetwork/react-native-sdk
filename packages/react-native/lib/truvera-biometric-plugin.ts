import {
  IDVProvider,
  getBiometricConfigs,
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {EventEmitter} from 'stream';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import {v4 as uuid} from 'uuid';

export type TruveraIDVConfig = {
  ecosystemID: string;
  issuerDID: string;
  enrollmentCredentialSchema: string;
  biometricMatchCredentialSchema: string;
  walletApiUrl: string;
  biometricMatchExpirationMinutes: number;
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

// Simulate a biometric check
// This function will store mock data in the keychain
// And right after that it will retrive that same information
// It will trigger a biometric check in the user device
async function simulateBiometricCheck() {
  const biometrySupported = await isBiometrySupported();
  
  if (biometrySupported) {
    await saveBiometricData('truvera-biometric-data', '1234567890');

    const biometricData: any = await getBiometricData();

    if (biometricData?.password) {
      return !!biometricData.password;
    }

    return false;
  }

  return true;
}

export const getIssuanceDate = () => {
  const timestamp = Date.now();
  const dateObject = new Date(timestamp);

  return dateObject.toISOString();
};

export function convertDateTimeToDate(dt: string) {
  return dt.split('T')[0];
}

/**
 * Issues enrollment credential
 * @param walletDID - DID of the wallet
 * @param truveraConfig - Configuration for Truvera IDV
 * @returns Promise resolving to the enrollment credential
 */
async function issueEnrollmentCredential(walletDID: string, truveraConfig: TruveraIDVConfig) {
  // Hardcoded biometric ID for now
  const biometricId = uuid();
  
  try {
    const issuanceDate = getIssuanceDate();
    const body = {
      anchor: false,
      persist: false,
      credential: {
        schema: truveraConfig.enrollmentCredentialSchema,
        name: getBiometricConfigs().enrollmentCredentialType,
        type: ['VerifiableCredential', getBiometricConfigs().enrollmentCredentialType],
        issuer: truveraConfig.issuerDID,
        issuanceDate,
        subject: {
          id: walletDID,
          biometric: {
            id: biometricId,
            data: JSON.stringify({id: biometricId}),
            created: convertDateTimeToDate(issuanceDate),
          },
        },
      },
      algorithm: 'dockbbs+',
    };

    const response = await axios.post(
      `${truveraConfig.walletApiUrl}/issue-credential`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to issue enrollment credential');
  }
}

/**
 * Issues match credential
 * @param walletDID - DID of the wallet
 * @param enrollmentCredential - The enrollment credential
 * @param truveraConfig - Configuration for Truvera IDV
 * @returns Promise resolving to the match credential
 */
async function issueMatchCredential(walletDID: string, enrollmentCredential: any, truveraConfig: TruveraIDVConfig) {
  try {
    const biometricId = enrollmentCredential.credentialSubject.biometric.id;
    
    // Calculate expiration date based on config
    const expirationMinutes = truveraConfig.biometricMatchExpirationMinutes || 2;
    const expirationDate = new Date(
      Date.now() + 1000 * 60 * expirationMinutes,
    ).toISOString();
    
    const issuanceDate = getIssuanceDate();
    const body = {
      anchor: false,
      persist: false,
      credential: {
        schema: truveraConfig.biometricMatchCredentialSchema,
        name: getBiometricConfigs().biometricMatchCredentialType,
        type: ['VerifiableCredential', getBiometricConfigs().biometricMatchCredentialType],
        issuer: truveraConfig.issuerDID,
        issuanceDate,
        expirationDate,
        subject: {
          id: walletDID,
          biometric: {
            id: biometricId,
            created: convertDateTimeToDate(issuanceDate),
          },
        },
      },
      algorithm: 'dockbbs+',
    };

    const response = await axios.post(
      `${truveraConfig.walletApiUrl}/issue-credential`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );


    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to issue match credential');
  }
}

export function createTruveraIDVProvider({
  wallet,
  eventEmitter,
  configs,
}: {
  wallet: IWallet;
  eventEmitter: EventEmitter;
  configs: TruveraIDVConfig;
}): IDVProvider {
  return {
    async enroll(walletDID, proofRequest) {
      const biometricResult = await simulateBiometricCheck();

      if (!biometricResult) {
        throw new Error('Biometric check failed');
      }

      const enrollmentCredential = await issueEnrollmentCredential(walletDID, configs);
      const matchCredential = await issueMatchCredential(walletDID, enrollmentCredential, configs);

      return {
        enrollmentCredential,
        matchCredential,
      };
    },
    async match(walletDID, enrollmentCredential, proofRequest) {
      const biometricResult = await simulateBiometricCheck();

      if (!biometricResult) {
        throw new Error('Biometric check failed');
      }

      const matchCredential = await issueMatchCredential(walletDID, enrollmentCredential, configs);

      return {
        matchCredential,
      };
    },
  };
}
