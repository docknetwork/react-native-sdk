import axios from 'axios';
import {
  isBiometrySupported,
  getTimestamp,
  saveBiometricData,
  getBiometricData,
} from './biometric-binding/helpers';
import {v4 as uuid} from 'uuid';
import { getDIDProvider } from './wallet';

const BIOMETRIC_KEY = uuid();
const BIOMETRIC_PROPERTIES = 'ua7iM2XgYQnjnKqVAr3F';

const BIOMETRIC_CREDENTIAL_TYPE = 'ForSurBiometric';
const BIOMETRIC_ENROLLMENT_CREDENTIAL_TYPE = 'BiometricEnrollment';

const initiateBiometricCheck = async () => {
  const biometrySupported = await isBiometrySupported();

  if (biometrySupported) {
    await saveBiometricData(BIOMETRIC_KEY, BIOMETRIC_PROPERTIES);

    const biometricData = await getBiometricData();

    if (biometricData?.password) {
      return biometricData.password;
    }
  }

  return uuid();
};

function hasProofOfBiometrics(proofRequest) {
  const fields = proofRequest.input_descriptors
    ?.map(input => input.constraints?.fields)
    .flat();
  const paths = fields.map(field=> field.path).flat();
  return paths?.includes('$.credentialSubject.biometric.id') && paths?.includes('$.credentialSubject.biometric.created');
}


async function issueBiometricsVC(type, data) {
  // We will be using a temporary staging-testnet API key, we should be able to switch it later and start using env variables
  // supporting mainnet and testnet
  const DOCK_API_KEY = process.env.DOCK_API_KEY || 'eyJzY29wZXMiOlsidGVzdCIsImFsbCJdLCJzdWIiOiI3Iiwic2VsZWN0ZWRUZWFtSWQiOiI4IiwiY3JlYXRvcklkIjoiNyIsImlhdCI6MTY5ODg1MzI0MiwiZXhwIjo0Nzc4MTQ5MjQyfQ.njdeY1QzgBP9alG2wWjr_8tpEGnMpa2baEPVhtjKYiZTHYe_FnBKVu7jksk-eoIOYqD41MtOP9mjn9cG9Ure2A';
  const body = {
    anchor: false,
    persist: false,
    credential: {
      name: type,
      type: ['VerifiableCredential', type],
      issuer: 'did:dock:5GJeBeStWSxqyPGUJnERMFhm3wKcfCZP6nhqtoKyRAmq9FeU',
      issuanceDate: getTimestamp(),
      subject: data,
    },
    algorithm: 'dockbbs+',
  };

  const response = await axios.post('https://api-staging.dock.io/credentials', body, {
    headers: {
      'Content-Type': 'application/json',
      'DOCK-API-TOKEN': DOCK_API_KEY,
    }
  });

  return response.data;
}

const issueEnrollmentCredential = async () => {
  const biometricId = await initiateBiometricCheck();

  try {
    const credential = await issueBiometricsVC(BIOMETRIC_ENROLLMENT_CREDENTIAL_TYPE, {
      id: await getDIDProvider().getDefaultDID(),
      biometric: {
        id: biometricId,
        data: JSON.stringify({ id: BIOMETRIC_PROPERTIES }),
        created: getTimestamp(),
      },
    });

    return credential;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to issue enrollment credential');
  }
};

const issueBiometricMatchCredential = async enrollmentCredential => {
  const biometricData = await getBiometricData();
  const biometricId = enrollmentCredential.credentialSubject.biometric.id;

  return await issueBiometricsVC(BIOMETRIC_CREDENTIAL_TYPE, {
    id: await getDIDProvider().getDefaultDID(),
    biometric: {
      id: biometricId,
      created: getTimestamp(),
      data: biometricData,
    },
  });
};

export const defaultBiometricsPlugin = {
  hasProofOfBiometrics,
  enrollBiometrics: issueEnrollmentCredential,
  matchBiometrics: issueBiometricMatchCredential,
};
