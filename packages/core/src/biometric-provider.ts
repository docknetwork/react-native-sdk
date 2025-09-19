/**
 * @module biometric-provider
 * @description Biometric plugin for the Truvera Wallet SDK.
 * This module provides functions for biometric enrollment, matching, and identity verification processes.
 */

import {WalletDocument} from '@docknetwork/wallet-sdk-wasm/src/types';
import {
  IWallet,
  BiometricsProviderConfigs,
  IDVProcessOptions,
  BiometricPlugin,
  IDVProvider,
  IDVProviderFactory,
  IBiometricProvider,
} from './types';
export type {
  BiometricsProviderConfigs,
  IDVProcessOptions,
  BiometricPlugin,
  IDVProvider,
  IDVProviderFactory,
  IBiometricProvider,
};
import {
  createCredentialProvider,
  Credential,
  CredentialStatus,
} from './credential-provider';
import assert from 'assert';
import {EventEmitter} from 'events';
import {createDIDProvider} from './did-provider';

let currentConfigs: BiometricsProviderConfigs<unknown> = null;

/**
 * Sets the global biometric provider configurations for the SDK
 * @param {BiometricsProviderConfigs<unknown>} configs - The biometric provider configurations to set
 * @param {string} configs.enrollmentCredentialType - The credential type for enrollment
 * @param {string} configs.biometricMatchCredentialType - The credential type for biometric matching
 * @param {any} [configs.idvProvider] - Optional IDV provider configuration
 * @example
 * import { setConfigs } from '@docknetwork/wallet-sdk-core/biometric-provider';
 *
 * setConfigs({
 *   enrollmentCredentialType: 'BiometricEnrollment',
 *   biometricMatchCredentialType: 'BiometricMatch',
 *   idvProvider: myIDVProviderConfig
 * });
 */
export function setConfigs(configs: BiometricsProviderConfigs<unknown>) {
  currentConfigs = configs;
}

/**
 * Checks if the biometric plugin is enabled by verifying if biometric match credential type is configured
 * @returns {boolean} True if biometric match credential type is configured, false otherwise
 * @example
 * import { isBiometricPluginEnabled, setConfigs } from '@docknetwork/wallet-sdk-core/biometric-provider';
 *
 * // Before configuration
 * console.log(isBiometricPluginEnabled()); // false
 *
 * // After configuration
 * setConfigs({
 *   enrollmentCredentialType: 'BiometricEnrollment',
 *   biometricMatchCredentialType: 'BiometricMatch'
 * });
 * console.log(isBiometricPluginEnabled()); // true
 */
export function isBiometricPluginEnabled() {
  return !!currentConfigs?.biometricMatchCredentialType;
}

/**
 * Asserts that biometric provider configurations are available
 * @throws {Error} If biometric provider configs are not set
 * @example
 * import { assertConfigs } from '@docknetwork/wallet-sdk-core/biometric-provider';
 *
 * try {
 *   assertConfigs();
 *   console.log('Biometric configs are available');
 * } catch (error) {
 *   console.error('Biometric configs missing:', error.message);
 * }
 */
export function assertConfigs() {
  assert(!!currentConfigs, 'Missing biometric provider configs');
}

/**
 * Gets the current biometric provider configurations
 * @returns {BiometricsProviderConfigs<unknown>} The current biometric provider configurations
 * @throws {Error} If biometric provider configs are not set
 * @example
 * import { getBiometricConfigs } from '@docknetwork/wallet-sdk-core/biometric-provider';
 *
 * try {
 *   const configs = getBiometricConfigs();
 *   console.log('Enrollment credential type:', configs.enrollmentCredentialType);
 *   console.log('Match credential type:', configs.biometricMatchCredentialType);
 * } catch (error) {
 *   console.error('Failed to get configs:', error.message);
 * }
 */
export function getBiometricConfigs() {
  assertConfigs();
  return currentConfigs;
}

/**
 * Checks if a proof request requires biometric credentials
 * @param {any} proofRequest - The proof request to analyze
 * @returns {boolean} True if the proof request requires biometric credentials
 * @example
 * import { hasProofOfBiometrics } from '@docknetwork/wallet-sdk-core/biometric-provider';
 *
 * const proofRequest = {
 *   input_descriptors: [{
 *     constraints: {
 *       fields: [{
 *         path: ['$.credentialSubject.biometric.id']
 *       }, {
 *         path: ['$.credentialSubject.biometric.created']
 *       }]
 *     }
 *   }]
 * };
 *
 * if (hasProofOfBiometrics(proofRequest)) {
 *   console.log('This proof request requires biometric verification');
 * }
 */
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


/**
 * Creates a biometric provider instance for identity verification and biometric credential management
 * @param {Object} params - Provider configuration
 * @param {IWallet} params.wallet - The wallet instance to use for credential storage
 * @param {IDVProviderFactory} params.idvProviderFactory - Factory for creating IDV provider instances
 * @returns {IBiometricProvider} A biometric provider instance with identity verification methods
 * @throws {Error} If wallet or idvProviderFactory is not provided
 * @see {@link IBiometricProvider} - The interface defining all available biometric provider methods
 * @example
 * import { createBiometricProvider } from '@docknetwork/wallet-sdk-core';
 *
 * const biometricProvider = createBiometricProvider({
 *   wallet,
 *   idvProviderFactory: myIDVFactory
 * });
 *
 * // Start identity verification process
 * const result = await biometricProvider.startIDV(proofRequest);
 * console.log('Enrollment credential:', result.enrollmentCredential);
 * console.log('Match credential:', result.matchCredential);
 *
 * // Listen for IDV events
 * biometricProvider.eventEmitter.on('onComplete', (data) => {
 *   console.log('IDV process completed:', data);
 * });
 */
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


  /**
   * Starts the identity verification process using biometric credentials
   * @memberof IBiometricProvider
   * @param {any} proofRequest - The proof request containing biometric requirements
   * @returns {Promise<{enrollmentCredential: Credential, matchCredential: Credential}>} The enrollment and match credentials
   * @throws {Error} If IDV process fails or biometric configs are missing
   * @example
   * const result = await biometricProvider.startIDV({
   *   input_descriptors: [{
   *     constraints: {
   *       fields: [{
   *         path: ['$.credentialSubject.biometric.id'],
   *         purpose: 'Biometric ID verification'
   *       }]
   *     }
   *   }]
   * });
   */
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
    /**
     * Starts the identity verification process using biometric credentials
     * @memberof IBiometricProvider
     */
    startIDV,
    /**
     * Event emitter for IDV process events (onDeepLink, onMessage, onError, onCancel, onComplete)
     * @memberof IBiometricProvider
     */
    eventEmitter,
  };
}
