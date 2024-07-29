import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  createBiometricBindingProvider,
  getBiometricConfigs,
  setBiometricConfigs,
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {certsApi, defaultBiometricsPlugin} from '@docknetwork/wallet-sdk-react-native/lib/default-biometrics-plugin';

import {
  closeWallet,
  getCredentialProvider,
  getDIDProvider,
  getWallet,
} from './helpers/wallet-helpers';
import {getEcosystems} from '@docknetwork/wallet-sdk-core/src/ecosystem-tools';
import {
  setDIDProvider,
  setWallet,
} from '@docknetwork/wallet-sdk-react-native/lib/wallet';
import { credentialService } from '@docknetwork/wallet-sdk-wasm/src/services/credential/service';

jest.mock('react-native-keychain', () => {
  return {
    getSupportedBiometryType: () => 'FACE_ID',
    ACCESS_CONTROL: {
      BIOMETRY_ANY: 1,
    },
    ACCESSIBLE: {
      WHEN_UNLOCKED: 1,
    },
    getGenericPassword: () => 'data',
  };
});

const configs = {
  enrollmentCredentialType: 'ForSurBiometricEnrollment',
  biometricMatchCredentialType: 'ForSurBiometric',
  biometricMatchExpirationMinutes: 2,
  issuerConfigs: [
    {
      networkId: 'testnet',
      did: 'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb',
      apiKey: process.env.SALES_CERTS_API_KEY,
      apiUrl: 'https://api-testnet.dock.io',
    },
  ],
};

describe('Biometric Plugin', () => {
  let plugin;

  beforeEach(() => {
    setBiometricConfigs(configs);
  });

  beforeAll(async () => {
    const wallet: IWallet = await getWallet();

    // Set react-native context
    setDIDProvider(getDIDProvider());
    setWallet(wallet);

    plugin = createBiometricBindingProvider({
      wallet,
      onEnroll: defaultBiometricsPlugin.enrollBiometrics,
      onMatch: defaultBiometricsPlugin.matchBiometrics,
      onCheckBiometryRequired: defaultBiometricsPlugin.hasProofOfBiometrics,
    });
  });

  it('should create enrollment credential', async () => {
    await plugin.enrollBiometry();

    expect(configs.enrollmentCredentialType).toBeDefined();

    const enrollmentCredentials = await getCredentialProvider().getCredentials(
      configs.enrollmentCredentialType,
    );

    expect(enrollmentCredentials.length).toBe(1);

    const {credentialSubject} = enrollmentCredentials[0];
    expect(credentialSubject.id).toBeDefined();
    expect(credentialSubject.biometric.created).toBeDefined();
    expect(credentialSubject.biometric.id).toBeDefined();
    expect(credentialSubject.biometric.data).toBeDefined();
  });

  it('should create bbs+ biometric match credential', async () => {
    setBiometricConfigs({
      ...configs,
      biometricMatchCredentialType: 'ForSurBiometricBBS',
    });
    const credential = await plugin.matchBiometry();
    const isBBS = await credentialService.isBBSPlusCredential({
      credential
    });
    expect(isBBS).toBe(true);

    const credentials = await getCredentialProvider().getCredentials('ForSurBiometricBBS');

    expect(credentials.length).toBe(1);

    const {credentialSubject} = credentials[0];
    expect(credentialSubject.id).toBeDefined();
    expect(credentialSubject.biometric.created).toBeDefined();
    expect(credentialSubject.biometric.id).toBeDefined();
    // should not share the biometric data
    expect(credentialSubject.biometric.data).toBe(true);
  })

  it('should remove old biometric match credential', async () => {
    await plugin.matchBiometry();

    const credentials = await getCredentialProvider().getCredentials(
      configs.enrollmentCredentialType,
    );

    expect(credentials.length).toBe(1);
  })

  it('should create vpi biometric match credential', async () => {
    const credential = await plugin.matchBiometry();
    const isKVAC = await credentialService.isKvacCredential({credential});
    expect(isKVAC).toBe(true);
  })

  afterAll(() => closeWallet());
});
