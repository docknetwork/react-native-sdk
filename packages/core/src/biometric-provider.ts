import {WalletDocument} from '@docknetwork/wallet-sdk-wasm/src/types';
import {IWallet} from './types';
import {
  createCredentialProvider,
  Credential,
  CredentialStatus,
} from './credential-provider';
import assert from 'assert';
import {EventEmitter} from 'events';
import {createDIDProvider} from './did-provider';

export type BiometricsProviderConfigs<E> = {
  // Generic configs used by the biometric provider
  enrollmentCredentialType: string;
  biometricMatchCredentialType: string;
  // IDV specific configs, it depends on the IDV provider and its implementation
  idvConfigs: E;
};

export interface IDVProcessOptions {
  onDeepLink?: () => void;
  onMessage?: () => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  onComplete?: (credential: any) => void;
}

export interface BiometricPlugin {
  onEnroll(walletDID: string): Promise<WalletDocument>;
  onMatch(
    walletDID: string,
    enrollmentCredential: Credential,
  ): Promise<WalletDocument>;
}

let currentConfigs: BiometricsProviderConfigs<unknown> = null;

export function setConfigs(configs: BiometricsProviderConfigs<unknown>) {
  currentConfigs = configs;
}

export function isBiometricPluginEnabled() {
  return !!currentConfigs?.biometricMatchCredentialType;
}

export function assertConfigs() {
  assert(!!currentConfigs, 'Missing biometric provider configs');
}

export function getBiometricConfigs() {
  assertConfigs();
  return currentConfigs;
}

export function hasProofOfBiometrics(proofRequest) {
  const fields = proofRequest.input_descriptors
    ?.map(input => input.constraints?.fields)
    .flat();
  const paths = fields.map(field => field.path).flat();
  return (
    paths?.includes('$.credentialSubject.biometric.id') &&
    paths?.includes('$.credentialSubject.biometric.created')
  );
}

// map for events
export const IDV_EVENTS = {
  onDeepLink: 'onDeepLink',
  onMessage: 'onMessage',
  onError: 'onError',
  onCancel: 'onCancel',
  onComplete: 'onComplete',
};

export interface IDVProvider {
  enroll(
    walletDID: string,
    proofRequest: any,
  ): Promise<{enrollmentCredential: Credential; matchCredential: Credential}>;
  match(
    walletDID: string,
    enrollmentCredential: Credential,
    proofRequest: any,
  ): Promise<{
    matchCredential: Credential;
  }>;
}

export interface IDVProviderFactory {
  create(eventEmitter: EventEmitter, wallet: IWallet): IDVProvider;
}

export function createBiometricProvider({
  wallet,
  idvProviderFactory,
}: {
  wallet: IWallet;
  idvProviderFactory: IDVProviderFactory;
}) {
  const credentialProvider = createCredentialProvider({wallet});
  const didProvider = createDIDProvider({wallet});
  const eventEmitter = new EventEmitter();
  const idvProvider = idvProviderFactory.create(eventEmitter, wallet);


  async function startIDV(proofRequest: any): Promise<{
    enrollmentCredential: Credential;
    matchCredential: Credential;
  }> {
    const walletDID = await didProvider.getDefaultDID();
    let [enrollmentCredential] = await credentialProvider.getCredentials(
      currentConfigs.enrollmentCredentialType,
    );

    // Remove any existing match credentials
    const existingMatchCredentials = await credentialProvider.getCredentials(
      currentConfigs.biometricMatchCredentialType,
    );
    for (const credential of existingMatchCredentials) {
      await credentialProvider.removeCredential(credential.id);
    }

    let matchCredential: Credential;

    if (!enrollmentCredential) {
      // call IDV to start enrollment process and issue the enrollment credential + match credential
      const credentials = await idvProvider.enroll(walletDID, proofRequest);

      // check if credential is already in the credential store
      const receivedViaDistribution = await credentialProvider.getById(
        credentials.matchCredential.id,
      );

      if (!receivedViaDistribution) {
        await credentialProvider.addCredential(
          credentials.enrollmentCredential,
        );
        await credentialProvider.addCredential(credentials.matchCredential);
      }

      matchCredential = credentials.matchCredential;
      enrollmentCredential = credentials.enrollmentCredential;
    } else {
      // call IDV to match the enrollment credential and issue the match credential
      const credentials = await idvProvider.match(
        walletDID,
        enrollmentCredential,
        proofRequest,
      );

      // check if credential is already in the credential store
      const receivedViaDistribution = await credentialProvider.getById(
        credentials.matchCredential.id,
      );

      if (!receivedViaDistribution) {
        await credentialProvider.addCredential(credentials.matchCredential);
      }

      matchCredential = credentials.matchCredential;
    }

    return {
      enrollmentCredential,
      matchCredential,
    };
  }

  return {
    startIDV,
    eventEmitter,
  };
}
