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

    const biometricData: any = await getBiometricData();

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

export const certsApi = {
  issueBiometricsVC: async function ({
    type,
    subject,
    expirationDate,
    algorithm,
    schema,
  }: any) {
    assertConfigs();

    const networkConfig = getIssuerConfigsForNetwork(
      getWallet().getNetworkId(),
    );

    assert(
      !!networkConfig,
      `No issuer config found for network ${getWallet().getNetworkId()}`,
    );

    const body = {
      anchor: false,
      persist: false,
      credential: {
        name: type,
        schema,
        type: ['VerifiableCredential', type],
        issuer: networkConfig.did,
        issuanceDate: getIssuanceDate(),
        expirationDate: expirationDate,
        subject,
      },
      algorithm: algorithm || 'dockbbs+',
    };

    try {
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
    } catch (err) {
      console.error(err);
      debugger;
    }
  },
  getTrustRegistries: async function () {
    assertConfigs();

    const networkConfig = getIssuerConfigsForNetwork(
      getWallet().getNetworkId(),
    );

    assert(
      !!networkConfig,
      `No issuer config found for network ${getWallet().getNetworkId()}`,
    );

    const response = await axios.get(
      `${networkConfig.apiUrl}/trust-registries/`,
      {
        headers: {
          'Content-Type': 'application/json',
          'DOCK-API-TOKEN': networkConfig.apiKey,
        },
      },
    );

    return response.data;
  },
  getTrustRegistrySchemas: async function ({registryId}) {
    assertConfigs();

    const networkConfig = getIssuerConfigsForNetwork(
      getWallet().getNetworkId(),
    );

    assert(
      !!networkConfig,
      `No issuer config found for network ${getWallet().getNetworkId()}`,
    );

    const response = await axios.get(
      `${networkConfig.apiUrl}/trust-registries/${registryId}/schemas`,
      {
        headers: {
          'Content-Type': 'application/json',
          'DOCK-API-TOKEN': networkConfig.apiKey,
        },
      },
    );

    return response.data;
  },
};

const issueEnrollmentCredential = async () => {
  const biometricId = await initiateBiometricCheck();

  try {
    const credential = await certsApi.issueBiometricsVC({
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

  const schema = await getDefaultBiometricSchema();
  const algorithm = isVpiSchema(schema) ? 'bbdt16' : 'dockbbs+';
  let created = getIssuanceDate();

  if (schema?.id) {
    const fetchSchemaResponse = await axios.get(schema?.id).catch((err) => {
      console.error(err);
      console.error('Failed to fetch schema data');
      return null
    });


    const {credentialSubject} = fetchSchemaResponse?.data?.properties;
    if (credentialSubject?.properties?.biometric?.properties?.created?.format === 'date') {
      created = created.split('T')[0];
    }
  }

  return await certsApi.issueBiometricsVC({
    type: getBiometricConfigs().biometricMatchCredentialType,
    algorithm,
    schema: schema?.id,
    expirationDate,
    subject: {
      id: await getDIDProvider().getDefaultDID(),
      biometric: {
        id: biometricId,
        created,
        // TODO: Certs template conditions needs to be updated to not require the data object
        // Workaround is to define that as true
        // We can remove this line once the template is updated
        data: true,
      },
    },
  });
};

export async function getBiometricSchemas() {
  const registries = await certsApi.getTrustRegistries();
  const schemas = [];

  for (const registry of registries) {
    const registrySchemas = await certsApi.getTrustRegistrySchemas({
      registryId: registry.id,
    });

    schemas.push(...registrySchemas.list);
  }

  return schemas.filter(
    schema =>
      schema.id.indexOf(getBiometricConfigs().biometricMatchCredentialType) >
      -1,
  );
}

export async function getDefaultBiometricSchema() {
  const schemas = await getBiometricSchemas();
  const vpiSchema = schemas.find(schema => schema.prices.length > 0);
  return vpiSchema || schemas[0];
}

export function isVpiSchema(schema) {
  return schema?.prices?.length > 0;
}

export const defaultBiometricsPlugin = {
  hasProofOfBiometrics,
  enrollBiometrics: issueEnrollmentCredential,
  matchBiometrics: issueBiometricMatchCredential,
};
