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

async function performBiometricCheck() {
  await Keychain.getGenericPassword({
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
  });
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
      await performBiometricCheck();

      const enrollmentCredential = await issueEnrollmentCredential(walletDID, configs);
      const matchCredential = await issueMatchCredential(walletDID, enrollmentCredential, configs);

      return {
        enrollmentCredential,
        matchCredential,
      };
    },
    async match(walletDID, enrollmentCredential, proofRequest) {
      await performBiometricCheck();

      const matchCredential = await issueMatchCredential(walletDID, enrollmentCredential, configs);

      return {
        matchCredential,
      };
    },
  };
}
