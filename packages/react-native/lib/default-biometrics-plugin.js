import axios from 'axios';
import {
  isBiometrySupported,
  getTimestamp,
  saveBiometricData,
  getBiometricData,
} from './biometric-binding/helpers';

const BIOMETRIC_KEY = 'placeholder-id';
const BIOMETRIC_PROPERTIES = 'ua7iM2XgYQnjnKqVAr3F';

const BIOMETRIC_CREDENTIAL_TYPE = 'BiometricsCredential';
const BIOMETRIC_ENROLLMENT_CREDENTIAL_TYPE = 'BiometricEnrollment';

const initiateBiometricCheck = async () => {
  const biometrySupported = await isBiometrySupported();

  if (biometrySupported) {
    await saveBiometricData(BIOMETRIC_KEY, BIOMETRIC_PROPERTIES);

    const biometricData = await getBiometricData();
    if (biometricData?.password) {
      return biometricData.password;
    } else {
      throw Error('Biometric data not found.');
    }
  } else {
    console.log('Biometry not supported on this device.');
    // Will fallback to mock biometrics
    return 'mocked-biometric-id';
  }
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
  const DOCK_API_KEY = process.env.DOCK_API_KEY || '***REMOVED***';
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

  const response = await axios.post('https://***REMOVED***/credentials', body, {
    headers: {
      'Content-Type': 'application/json',
      'DOCK-API-TOKEN': DOCK_API_KEY,
    }
  });

  return response.data;
}

const issueEnrollmentCredential = async () => {
  const biometricId = await initiateBiometricCheck();

  if (!biometricId) {
    throw new Error('biometrics-not-supported');
  }

  try {
    const credential = await issueBiometricsVC(BIOMETRIC_ENROLLMENT_CREDENTIAL_TYPE, {
      biometric: {
        id: biometricId,
        data: JSON.stringify({ id: BIOMETRIC_PROPERTIES })
      }
    });

    return credential;
  } catch(err) {
    console.error(err);
    throw new Error('Unable to issue enrollment credential');
  }
};

const issueBiometricMatchCredential = async enrollmentCredential => {
  const biometricData = await getBiometricData();
  if (!biometricData) {
    throw new Error('Biometrics check failed');
  }

  // Will disable real biometric check for now
  // const biometricId = biometricData.password;
  const biometricId = enrollmentCredential.credentialSubject.biometric.id;

  if (biometricId === enrollmentCredential.credentialSubject.biometric.id) {
    const currentTime = getTimestamp();
    return await issueBiometricsVC(BIOMETRIC_CREDENTIAL_TYPE, {
      biometric: {
        id: biometricId,
        created: currentTime,
      }
    });
  }

  throw new Error('Enrollment credential not found');
};

export const defaultBiometricsPlugin = {
  hasProofOfBiometrics,
  enrollBiometrics: issueEnrollmentCredential,
  matchBiometrics: issueBiometricMatchCredential,
};
