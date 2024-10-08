## Installation

```bash

yarn add @docknetwork/wallet-sdk-core
yarn add @docknetwork/wallet-sdk-data-store-typeorm
yarn add typeorm
yarn add sqlite3

```

Create your wallet

```js
import {createWallet} from '@docknetwork/wallet-sdk-core';
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-web/src';
import {createCredentialProvider} from '@docknetwork/wallet-sdk-core/src/credential-provider';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';

const dataStore = await createDataStore({
  databasePath: 'dock-wallet',
  defaultNetwork: 'testnet',
});

const wallet = await createWallet({
  dontWaitForNetwork: true,
  dataStore,
});

const credentialProvider = createCredentialProvider({wallet});

credentialProvider.addCredential({
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      BasicCredential: 'dk:BasicCredential',
      name: 'dk:name',
      email: 'dk:email',
      logo: 'dk:logo',
      description: 'dk:description',
    },
    'https://ld.dock.io/credentials/prettyvc',
  ],
  id: 'https://creds.dock.io/ce94a646535dbc2a2102e37e9f875b44c225cb4f37b1cdac2b1677829afeb100',
  type: [
    'VerifiableCredential',
    'BasicCredential',
    'PrettyVerifiableCredential',
  ],
});

const proofRequest = {
  id: '37ba730c-4b58-44d3-88cd-d4f5be32b698',
  name: 'Testing',
  nonce: '625990',
  created: '2024-06-11T19:37:31.263Z',
  did: 'did:dock:5HKkVpaciu1RArV13E7ig3i84JtiMTcwoXoHPZ8VMrBUYJ4w',
  response_url:
    'https://api-testnet.dock.io/proof-requests/37ba730c-4b58-44d3-88cd-d4f5be32b698/send-presentation',
  request: {
    id: '37ba730c-4b58-44d3-88cd-d4f5be32b698',
    input_descriptors: [
      {
        id: 'Credential 1',
        name: 'Testing',
        purpose: 'Testing',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.id'],
            },
          ],
        },
      },
    ],
    submission_requirements: [],
  },
  type: 'proof-request',
};
const verification = await createVerificationController({
  wallet,
});

await verification.start({
  template: proofRequest,
});

verification.selectedCredentials.set(credential.id, {
  credential: credential,
});

const presentation = await verification.createPresentation();

console.log(presentation);

const result = await verification.submitPresentation(presentation);

console.log('Result from certs');
```
