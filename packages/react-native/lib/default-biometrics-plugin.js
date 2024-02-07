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
  }
};

function hasProofOfBiometrics(proofRequest) {
  const fields = proofRequest.input_descriptors
    ?.map(input => input.constraints?.fields)
    .flat();
  return (
    fields.findIndex(
      field =>
        field.path?.includes('$.type[*]') &&
        field.filter?.const === BIOMETRIC_CREDENTIAL_TYPE,
    ) !== -1
  );
}


async function issueBiometricsVC(type, data) {
  const DOCK_API_KEY = process.env.DOCK_API_KEY;

  const options = {
    method: 'POST',
    url: 'https://api-testnet.dock.io/credentials',
    headers: {
      'Content-Type': 'application/json',
      'DOCK-API-TOKEN': DOCK_API_KEY,
    },
    data: {
      anchor: false,
      persist: false,
      credential: {
        name: type,
        type: ['VerifiableCredential', type],
        issuer: 'did:dock:5DpnDQaqHCBBdDjXpiaWibgUb6Tymz1vFG1UMJv9H363fYFb',
        issuanceDate: getTimestamp(),
        subject: data,
      },
      algorithm: 'dockbbs+',
    },
  };

  const credential = await axios.request(options)
  return credential;
}

const issueEnrollmentCredential = async () => {
  const biometricId = await initiateBiometricCheck();
  if (!biometricId) {
    throw new Error('Biometrics check failed');
  }

  return await issueBiometricsVC(BIOMETRIC_ENROLLMENT_CREDENTIAL_TYPE, {
    biometricProperties: JSON.stringify({ id: BIOMETRIC_PROPERTIES }),
    biometricId,
  });
};

const issueBiometricMatchCredential = async enrollmentCredential => {
  const biometricData = await getBiometricData();
  if (!biometricData) {
    throw new Error('Biometrics check failed');
  }

  const biometricId = biometricData.password;

  if (biometricId === enrollmentCredential.credentialSubject.biometricId) {
    const currentTime = getTimestamp();
    return await issueBiometricsVC(BIOMETRIC_CREDENTIAL_TYPE, {
      timestamp: currentTime,
      biometricId,
    });
  }

  throw new Error('Enrollment credential not found');
};

export const defaultBiometricsPlugin = {
  hasProofOfBiometrics,
  enrollBiometrics: issueEnrollmentCredential,
  matchBiometrics: issueBiometricMatchCredential,
};
