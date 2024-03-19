import axios from 'axios';
import {
  isBiometrySupported,
  getTimestamp,
  saveBiometricData,
  getBiometricData,
} from './biometric-binding/helpers';
import {v4 as uuid} from 'uuid';
import { getDIDProvider, getWallet } from './wallet';
import assert from 'assert';

const BIOMETRIC_KEY = uuid();
const BIOMETRIC_PROPERTIES = 'ua7iM2XgYQnjnKqVAr3F';

const BIOMETRIC_CREDENTIAL_TYPE = 'ForSurBiometric';
const BIOMETRIC_ENROLLMENT_CREDENTIAL_TYPE = 'BiometricEnrollment';


export type BiometricsPluginIssuerConfig = {
  networkId: string;
  did: string;
  apiKey: string;
  apiUrl: string;
}

export type BiometricsPluginConfigs = {
  enrollmentCredentialType: string;
  biometricMatchCredentialType: string;
  issuerConfigs:BiometricsPluginIssuerConfig[];
}

let configs: BiometricsPluginConfigs = null;


function initialize(_configs: BiometricsPluginConfigs) {
  configs = _configs;
};

function assertConfigs() {
  assert(!!configs, 'Biometrics plugin not configured');
}


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

function getIssuerConfigsForNetwork(): BiometricsPluginIssuerConfig {
  const wallet = getWallet().getNetworkId();
  return configs?.issuerConfigs.find(config => config.networkId === wallet);
}

function hasProofOfBiometrics(proofRequest) {
  const fields = proofRequest.input_descriptors
    ?.map(input => input.constraints?.fields)
    .flat();
  const paths = fields.map(field=> field.path).flat();
  return paths?.includes('$.credentialSubject.biometric.id') && paths?.includes('$.credentialSubject.biometric.created');
}


async function issueBiometricsVC(type, data) {
  assertConfigs();

  const networkConfig = getIssuerConfigsForNetwork();

  assert(!!networkConfig, `No issuer config found for network ${getWallet().getNetworkId()}`);

  const body = {
    anchor: false,
    persist: false,
    credential: {
      name: type,
      type: ['VerifiableCredential', type],
      issuer: networkConfig.did,
      issuanceDate: getTimestamp(),
      subject: data,
    },
    algorithm: 'dockbbs+',
  };

  const response = await axios.post(`${networkConfig.apiUrl}/credentials`, body, {
    headers: {
      'Content-Type': 'application/json',
      'DOCK-API-TOKEN': networkConfig.apiKey,
    },
  });

  return response.data;
}

const issueEnrollmentCredential = async () => {
  assertConfigs();

  const biometricId = await initiateBiometricCheck();

  try {
    const credential = await issueBiometricsVC(configs.enrollmentCredentialType, {
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
  assertConfigs();

  const biometricData = await getBiometricData();
  const biometricId = enrollmentCredential.credentialSubject.biometric.id;

  return await issueBiometricsVC(configs.biometricMatchCredentialType, {
    id: await getDIDProvider().getDefaultDID(),
    biometric: {
      id: biometricId,
      created: getTimestamp(),
    },
  });
};

function isEnabled() {
  const networkConfigs = getIssuerConfigsForNetwork();
  return !!networkConfigs;
}

export const defaultBiometricsPlugin = {
  isEnabled,
  initialize,
  hasProofOfBiometrics,
  enrollBiometrics: issueEnrollmentCredential,
  matchBiometrics: issueBiometricMatchCredential,
};
