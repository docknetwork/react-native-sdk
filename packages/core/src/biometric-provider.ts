import {WalletDocument} from '@docknetwork/wallet-sdk-wasm/src/types';
import {IWallet} from './types';
import {createCredentialProvider} from './credential-provider';

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
      const CREDENTIAL_TYPE = 'BiometricEnrollment';
      const enrollmentCredentials = await wallet.getDocumentsByType(
        CREDENTIAL_TYPE,
      );

      if (!enrollmentCredentials.length) {
        throw new Error('Enrollment credential not found');
      }

      const matchConfirmationCredential = await onMatch(
        enrollmentCredentials[0],
      );
      await credentialProvider.addCredential(matchConfirmationCredential);
      return matchConfirmationCredential;
    },
    checkIsBiometryRequired: onCheckBiometryRequired,
  };
}
