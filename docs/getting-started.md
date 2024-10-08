## Installation

```bash

yarn add @docknetwork/wallet-sdk-data-store-web
yarn add @docknetwork/wallet-sdk-core


## if you want to use nodejs
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

credentialProvider.addCredential('https://creds-testnet.dock.io/8489dc69b69a70c97646ad9b4f256acaddb57762b5a6f661f0c9dae3b7f72ea6', {
  // TODO: Add the credential using URL and password
  onPasswordRequest: async () => {
    return 'test';
  },
});

const proofRequest = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://www.w3.org/2018/credentials/examples/v1',
  ],
  type: ['VerifiablePresentation'],
  verifiableCredential: [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      type: ['VerifiableCredential'],
      credentialSubject: {
        name: 'Alice',
      },
    },
  ],
}
const verification = await createVerificationController({
  wallet,
});

await verification.start({
  template: proofRequest,
});

verification.selectedCredentials.set(credential.id, {
  credential: credential,
  attributesToReveal: ['credentialSubject.name']
});

const presentation = await verification.createPresentation();

console.log(presentation);

const result = await verification.submitPresentation(presentation);
  
console.log('Result from certs');

```



