import axios from 'axios';
import {
  isBiometrySupported,
  getIssuanceDate,
  saveBiometricData,
  getBiometricData,
} from './biometric-binding/helpers';
import {v4 as uuid} from 'uuid';
import {getDIDProvider, getWallet} from './wallet';
import assert from 'assert';
import {
  assertConfigs,
  getBiometricConfigs,
  getIssuerConfigsForNetwork,
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';

const BIOMETRIC_KEY = uuid();
const BIOMETRIC_PROPERTIES = 'ua7iM2XgYQnjnKqVAr3F';

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
  const paths = fields.map(field => field.path).flat();
  return (
    paths?.includes('$.credentialSubject.biometric.id') &&
    paths?.includes('$.credentialSubject.biometric.created')
  );
}

async function issueBiometricsVC({type, subject, expirationDate}: any) {
  assertConfigs();

  const networkConfig = getIssuerConfigsForNetwork(getWallet().getNetworkId());

  assert(
    !!networkConfig,
    `No issuer config found for network ${getWallet().getNetworkId()}`,
  );

  const body = {
    anchor: false,
    persist: false,
    credential: {
      name: type,
      type: ['VerifiableCredential', type],
      issuer: networkConfig.did,
      issuanceDate: getIssuanceDate(),
      expirationDate: expirationDate,
      subject,
    },
    algorithm: 'dockbbs+',
  };

  const response = await axios.post(
    `${networkConfig.apiUrl}/credentials`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'DOCK-API-TOKEN': networkConfig.apiKey,
      },
    },
  );

  return response.data;
}

const issueEnrollmentCredential = async () => {
  const biometricId = await initiateBiometricCheck();

  try {
    const credential = await issueBiometricsVC({
      type: getBiometricConfigs().enrollmentCredentialType,
      subject: {
        id: await getDIDProvider().getDefaultDID(),
        biometric: {
          id: biometricId,
          data: JSON.stringify({id: BIOMETRIC_PROPERTIES}),
          created: getIssuanceDate(),
        },
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

  // Default will be 2 minutes
  const expirationMinutes =
    getBiometricConfigs().biometricMatchExpirationMinutes || 2;

  const expirationDate = new Date(
    Date.now() + 1000 * 60 * expirationMinutes,
  ).toISOString();

  return await issueBiometricsVC({
    type: getBiometricConfigs().biometricMatchCredentialType,
    expirationDate,
    subject: {
      id: await getDIDProvider().getDefaultDID(),
      biometric: {
        id: biometricId,
        created: getIssuanceDate(),
        // TODO: Certs template conditions needs to be updated to not require the data object
        // Workaround is to define that as true
        // We can remove this line once the template is updated
        data: true,
      },
    },
  });
};

export const defaultBiometricsPlugin = {
  hasProofOfBiometrics,
  enrollBiometrics: issueEnrollmentCredential,
  matchBiometrics: issueBiometricMatchCredential,
};
