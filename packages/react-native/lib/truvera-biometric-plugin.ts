import {
  IDV_EVENTS,
  IDVProvider,
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {EventEmitter} from 'stream';
import * as Keychain from 'react-native-keychain';

export type TruveraIDVConfig = {
  issuerDID: string;
  idvApiURL: string;
  biometricMatchExpirationMinutes: number;
};


async function performBiometricCheck() {
  await Keychain.getGenericPassword({
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
  });
}

export function createTruveraIDVProviderFactory({
  wallet,
  eventEmitter,
  configs,
}: {
  wallet: IWallet;
  eventEmitter: EventEmitter;
  configs: TruveraIDVConfig;
}): IDVProvider {
  return {
    async enroll(walletDID, proofRequest) {
      await performBiometricCheck();

      // TODO: issue enrollment credential
      const enrollmentCredential = {};
      // TODO: issue match credential
      const matchCredential = {};

      return {
        enrollmentCredential,
        matchCredential,
      };
    },
    async match(walletDID, enrollmentCredential, proofRequest) {
      await performBiometricCheck();

      // TODO: issue match credential
      const matchCredential = {};

      return {
        matchCredential,
      };
    },
  };
}
