import {createWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-typeorm/lib';
import {createCredentialProvider} from '@docknetwork/wallet-sdk-core/lib/credential-provider';
import axios from 'axios';
import {createDIDProvider} from '@docknetwork/wallet-sdk-core/lib/did-provider';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/lib/verification-controller';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';

async function main() {
  const dataStore = await createDataStore({
    databasePath: 'dock-wallet',
    defaultNetwork: 'testnet',
  });

  const wallet = await createWallet({
    dataStore,
  });

  await wallet.waitForEvent(WalletEvents.networkConnected);

  const didProvider = createDIDProvider({
    wallet,
  });

  const defaultDID = await didProvider.getDefaultDID();

  console.log('wallet default DID:');
  console.log(defaultDID);

  const credentialProvider = createCredentialProvider({
    wallet,
  });

  console.log('Fetching credential data...');
  const {data: rawCredential} = await axios.get(
    'https://creds-testnet.dock.io/8489dc69b69a70c97646ad9b4f256acaddb57762b5a6f661f0c9dae3b7f72ea6',
    {
      params: {
        p: btoa('test'),
      },
    },
  );

  console.log('Credential data fetched');

  let credential = await credentialProvider.getById(rawCredential.id);

  if (!credential) {
    credential = await credentialProvider.addCredential(rawCredential);
  }

  console.log('Credential:');
  console.log(credential);

  const verificationController = createVerificationController({
    wallet,
  });

  await verificationController.start({
    template:
      'https://creds-testnet.dock.io/proof/7eac58b2-125a-49db-a3c5-c4ac2cc030cc',
  });

  verificationController.selectedCredentials.set(credential.id, {
    credential: credential,
    attributesToReveal: ['credentialSubject.name'],
  });

  const presentation = await verificationController.createPresentation();

  console.log('Presentation created...');
  console.log(presentation);

  try {
    // Submit the presentation for verification
    const verificationResponse =
      await verificationController.submitPresentation(presentation);
    console.log(verificationResponse);
  } catch (err) {
    console.error(err);
  }
}

main();
