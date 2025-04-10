import {WalletDocument} from '@docknetwork/wallet-sdk-wasm/src/types';
import {IWallet} from './types';
import {createCredentialProvider, CredentialStatus} from './credential-provider';
import assert from 'assert';

export type BiometricsPluginIssuerConfig = {
  networkId: string;
  did: string;
  apiKey: string;
  apiUrl: string;
}

export type BiometricsPluginConfigs = {
  enrollmentCredentialType: string;
  biometricMatchCredentialType: string;
  biometricMatchExpirationMinutes: number;
  issuerConfigs:BiometricsPluginIssuerConfig[];
}

let configs: BiometricsPluginConfigs = null;

export function setBiometricConfigs(_configs: BiometricsPluginConfigs) {
  configs = _configs;
};

export function assertConfigs() {
  assert(!!configs, 'Biometrics plugin not configured');
}

export function getBiometricConfigs() {
  assertConfigs();
  return configs;
}

export function getIssuerConfigsForNetwork(networkId): BiometricsPluginIssuerConfig {
  return getBiometricConfigs()?.issuerConfigs.find(config => config.networkId === networkId);
}

export function createBiometricBindingProvider({
  wallet,
  onEnroll,
  onMatch,
  onCheckBiometryRequired,
}: {
  wallet: IWallet;
  onEnroll: () => Promise<WalletDocument>;
  onMatch: (biometricTemplate: WalletDocument) => Promise<WalletDocument>;
  onCheckBiometryRequired: (request) => boolean;
}) {
  const credentialProvider = createCredentialProvider({wallet});
  return {
    enrollBiometry: async () => {
      const enrollmentCredential = await onEnroll();
      return await credentialProvider.addCredential(enrollmentCredential);
    },
    matchBiometry: async () => {
      const CREDENTIAL_TYPE = configs.enrollmentCredentialType;
      const enrollmentCredentials = await wallet.getDocumentsByType(
        CREDENTIAL_TYPE,
      );

      if (!enrollmentCredentials.length) {
        throw new Error('Enrollment credential not found');
      }

      const matchConfirmationCredential = await onMatch(
        enrollmentCredentials[0],
      );

      if (matchConfirmationCredential) {
        const biometricMatchCredentials = await wallet.getDocumentsByType(configs.biometricMatchCredentialType);
        for (let i = 0; i < biometricMatchCredentials.length; i++) {
          await wallet.removeDocument(biometricMatchCredentials[0].id);
        }

        await wallet.addDocument(matchConfirmationCredential);
        // make the biometric credential valid by default
        await wallet.addDocument({
          id: `${matchConfirmationCredential.id}#status`,
          status: CredentialStatus.Verified,
          type: 'CredentialStatus',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      return matchConfirmationCredential;
    },
    checkIsBiometryRequired: onCheckBiometryRequired,
  };
}
