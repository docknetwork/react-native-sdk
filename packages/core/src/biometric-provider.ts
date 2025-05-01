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
  onMatchCredential: 'onMatchCredential',
  onEnrollmentCredential: 'onEnrollmentCredential',
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

  // Listen for match credential
  eventEmitter.on(IDV_EVENTS.onMatchCredential, async (credential: string) => {
    await credentialProvider.addCredential(credential);
  });

  // Listen for enrollment credential
  eventEmitter.on(IDV_EVENTS.onEnrollmentCredential, async (credential: string) => {
    await credentialProvider.addCredential(credential);
  });

  async function startIDV(proofRequest: any) {
    const walletDID = await didProvider.getDefaultDID();
    let [existingEnrollmentCredential] = await credentialProvider.getCredentials(
      currentConfigs.enrollmentCredentialType,
    );

    if (!existingEnrollmentCredential) {
      // call IDV to start enrollment process and issue the enrollment credential + match credential
      await idvProvider.enroll(
        walletDID,
        proofRequest,
      );

      // wait for the enrollment credential to be received
      await new Promise((resolve) => {
        eventEmitter.on(IDV_EVENTS.onEnrollmentCredential, resolve);
      });

      // wait for the match credential to be received
      await new Promise((resolve) => {
        eventEmitter.on(IDV_EVENTS.onMatchCredential, resolve);
      });
    } else {
      // call IDV to match the enrollment credential and issue the match credential
      await idvProvider.match(
        walletDID,
        existingEnrollmentCredential,
        proofRequest,
      );

      // wait for the match credential to be received
      await new Promise((resolve) => {
        eventEmitter.on(IDV_EVENTS.onMatchCredential, resolve);
      });
    }

    eventEmitter.emit(IDV_EVENTS.onComplete);
  }

  return {
    startIDV,
    eventEmitter,
  };
}
