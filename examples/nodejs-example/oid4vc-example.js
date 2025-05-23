import {createWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-typeorm/lib';
import {createCredentialProvider} from '@docknetwork/wallet-sdk-core/lib/credential-provider';
import {createDIDProvider} from '@docknetwork/wallet-sdk-core/lib/did-provider';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';
import assert from 'assert';

const credentialOfferUrl = process.env.CREDENTIAL_OFFER_URL;

assert(!!credentialOfferUrl, 'Please define the OID4VC URL');

async function main() {
  const dataStore = await createDataStore({
    databasePath: 'dock-wallet',
    defaultNetwork: 'testnet',
  });

  const wallet = await createWallet({
    dataStore,
  });

  // Wait for the wallet to connect to the network
  await wallet.waitForEvent(WalletEvents.networkConnected);

  const didProvider = createDIDProvider({
    wallet,
  });

  const defaultDID = await didProvider.getDefaultDID();

  console.log(`Wallet DID: ${defaultDID}`);

  const credentialProvider = createCredentialProvider({
    wallet,
  });

  console.log('Fetching the credential from the OID4VC issuer');

  await credentialProvider.importCredentialFromURI({
    uri: credentialOfferUrl,
    didProvider,
  });

  console.log('Credential added to the wallet!');

  const credentials = await credentialProvider.getCredentials();

  console.log('List of all credentials:');

  for (let i = 0; i < credentials.length; i++) {
    const credential = credentials[i];
    console.log(`Credential ${credential.id}`);
  }
}

main();
