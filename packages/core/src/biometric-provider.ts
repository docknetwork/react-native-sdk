import {WalletDocument} from '@docknetwork/wallet-sdk-wasm/src/types';
import {IWallet} from './types';
import {
  createCredentialProvider,
  Credential,
  CredentialStatus,
} from './credential-provider';
import assert from 'assert';
import {EventEmitter} from 'stream';
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

export function assertConfigs() {
  assert(!!currentConfigs, 'Missing biometric provider configs');
}

export function getBiometricConfigs() {
  assertConfigs();
  return currentConfigs;
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


  async function startIDV(proofRequest: any) {
    const walletDID = await didProvider.getDefaultDID();
    let [existingEnrollmentCredential] = await credentialProvider.getCredentials(
      currentConfigs.enrollmentCredentialType,
    );

    if (!existingEnrollmentCredential) {
      // call IDV to start enrollment process and issue the enrollment credential + match credential
      const credentials = await idvProvider.enroll(
        walletDID,
        proofRequest,
      );

      await credentialProvider.addCredential(credentials.enrollmentCredential);
      await credentialProvider.addCredential(credentials.matchCredential);
    } else {
      // call IDV to match the enrollment credential and issue the match credential
      const credentials = await idvProvider.match(
        walletDID,
        existingEnrollmentCredential,
        proofRequest,
      );

      await credentialProvider.addCredential(credentials.matchCredential);
    }
  }

  return {
    startIDV,
    eventEmitter,
  };
}
