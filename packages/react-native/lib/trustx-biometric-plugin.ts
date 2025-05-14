import {
  IDV_EVENTS,
  IDVProvider,
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {EventEmitter} from 'stream';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';

export type TrustXIDVConfig = {
  walletApiUrl: string;
};

async function performBiometricCheck() {
  await Keychain.getGenericPassword({
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
  });
}

export function createTrustXIDVProvider({
  wallet,
  eventEmitter,
  configs,
}: {
  wallet: IWallet;
  eventEmitter: EventEmitter;
  configs: TrustXIDVConfig;
}): IDVProvider {
  return {
    async enroll(walletDID, proofRequest) {
      const {data: {uiUrl}} = await axios.post(`${configs.walletApiUrl}/create-trustx-process-token`, {
        dock_wallet_id: walletDID,
      });

      // Emit the deep link event to the event emitter
      // The Wallet App should open the URL in the WebView
      // When the user completes the biometric check, the IDV will issue the biometric credential
      // The wallet will receive the credential via DID distribution
      // The wallet will emit the onComplete event with the enrollment credential + match credential
      eventEmitter.emit(IDV_EVENTS.onDeepLink, uiUrl);

      return new Promise((resolve, reject) => {
        eventEmitter.on(IDV_EVENTS.onComplete, ({ enrollmentCredential, matchCredential }) => {
          resolve({ enrollmentCredential, matchCredential });
        });
      });
    },
    async match(walletDID, enrollmentCredential, proofRequest) {
      await performBiometricCheck();

      const biometric_enrollment_id = enrollmentCredential.credentialSubject.biometric_enrollment_id;

      const {data: {uiUrl}} = await axios.post(`${configs.walletApiUrl}/create-trustx-process-token`, {
        dock_wallet_id: walletDID,
        biometric_enrollment_id,
      });

      // Emit the deep link event to the event emitter
      // The Wallet App should open the URL in the WebView
      // When the user completes the biometric check, the IDV will issue the biometric credential
      // The wallet will receive the credential via DID distribution
      // The wallet will emit the onComplete event with the match credential
      eventEmitter.emit(IDV_EVENTS.onDeepLink, uiUrl);

      return new Promise((resolve, reject) => {
        eventEmitter.on(IDV_EVENTS.onComplete, ({ matchCredential }) => {
          resolve({ matchCredential });
        });
      });
    },
  };
}
