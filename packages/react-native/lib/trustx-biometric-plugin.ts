import {
  IDV_EVENTS,
  IDVProvider,
} from '@docknetwork/wallet-sdk-core/src/biometric-provider';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {EventEmitter} from 'stream';
import * as Keychain from 'react-native-keychain';

export type TrustXIDVConfig = {
  // TrustX API URL
  apiURL: string;
};


async function performBiometricCheck() {
  await Keychain.getGenericPassword({
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
  });
}

export function createTrustXIDVProviderFactory({
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
      
      // TODO: get start URL from TrustX API
      // Will send the walletDID and processID to TrustX API
      const startURL = 'https://trustx.com/start-url';


      // Emit the deep link event to the event emitter
      // The Wallet App should open the URL in the browser
      eventEmitter.emit(IDV_EVENTS.onDeepLink, startURL);


      // Now we need to listen for a onComplete event from trustx webivew
      // and wait for the credential to be received via DID distribution

      // TrustX will issue the credentials and send to the wallet via DID distribution
      // We need to listen for new credentials sent to the wallet


      // Listen for 
      // await performBiometricCheck();

      // TODO: issue enrollment credential
      // const enrollmentCredential = {};
      // TODO: issue match credential
      // const matchCredential = {};

      // return {
      //   enrollmentCredential,
      //   matchCredential,
      // };
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
