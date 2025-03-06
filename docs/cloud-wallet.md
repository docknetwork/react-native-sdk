# Cloud Wallet Documentation

The Cloud Wallet feature allows secure storage and synchronization of wallet documents via an [Encrypted Data Vault (EDV)](https://digitalbazaar.github.io/encrypted-data-vaults/).

**File Path:** `@docknetwork/wallet-sdk-core/src/cloud-wallet`

## Feature Overview

The Cloud Wallet integrates with an [Encrypted Data Vault (EDV)](https://digitalbazaar.github.io/encrypted-data-vaults/) to securely store, sync, and manage documents. Once initialized, it automatically synchronizes documents between the EDV and the wallet, allowing you to add, update, remove, without dealing with the synchronization logic.

## Usage Example

The example below demonstrates how to initialize and use the Cloud Wallet for managing documents.

### Step 1: Initialize the Data Store

First, you need to create local data storage to connect to the credential wallet.

#### For Mobile and Node.js

```ts
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-typeorm/lib';

const dataStore = await createDataStore({
  databasePath: 'dock-wallet',
  dbType: 'sqlite',
  defaultNetwork: 'testnet',
});
```

#### For Browser

```ts
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-web/lib';

const dataStore = await createDataStore({
  databasePath: 'dock-wallet',
  defaultNetwork: 'testnet',
});
```

### Step 2: Generate Wallet Key and Mnemonic

Next, we generate key and mnemonic for interacting with the cloud wallet. Use the same Cloud Wallet key across multiple devices to access the same documents. These keys are used to encrypt, decrypt, and locate documents in the EDV.

```ts
import {generateCloudWalletMasterKey} from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';

const {masterKey, mnemonic} = await generateCloudWalletMasterKey();
```

The `masterKey` is used to derive encryption keys for the EDV, while the `mnemonic` is used to recover the master key.

**Note:** Encryption keys can be derived from biometric data through a third-party service, offering enhanced security by linking the keys to a user's unique biometric profile

If the master key is lost, the mnemonic can be used to recover it. Store the mnemonic securely and do not share it with anyone.
```ts
import {recoverCloudWalletMasterKey} from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';

const masterKey = await recoverCloudWalletMasterKey(mnemonic);
```

### Step 3: Initialize the Cloud Wallet

After setting up the data store and generating key, initialize the Cloud Wallet and connect it to the local data storage. This ensures continuous synchronization between the EDV and the wallet.

```ts
import {initializeCloudWallet} from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';

const {pullDocuments} = await initializeCloudWallet({
  dataStore,
  edvUrl: EDV_URL, 
  authKey: EDV_AUTH_KEY,
  masterKey,
});

// Pull documents from the EDV and sync with the wallet
await pullDocuments();
```

The `pullDocuments` function synchronizes the EDV and the wallet by comparing documents and updating the data store accordingly. Documents can be credentials or messages.

### Step 4: Create a New Wallet

Now, create a credential wallet inside of the data storage. This will allow you to add, update, and remove documents.

```ts
import {createWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';

const wallet = await createWallet({
  dataStore,
});
```

### Step 5: Add a Document to the Wallet

You can add a document to the wallet using the following code:

```ts
const document = {
  id: 'document-id',
  type: 'document-type',
  someData: 'any-data-you-want',
};

await wallet.addDocument(document);
```

### Issuing Credentials to Cloud Wallet

You can issue credentials directly to a cloud wallet using the Truvera Workspace/API. The credential will be automatically distributed to the holder's cloud wallet through the DIDComm protocol, eliminating the need for direct API calls or manual credential handling.

#### Important Requirement

For the DIDComm automatic distribution to work properly, the **subject ID of the credential must be set to the holder's DID** when issuing the credential. This enables the system to route the credential to the correct wallet.

#### Receiving Credentials in Cloud Wallet

After a credential has been issued to a holder's DID, the cloud wallet only needs to fetch and process DIDComm messages to receive it:

```ts
import {createDIDProvider} from '@docknetwork/wallet-sdk-core/lib/did-provider';
import {createMessageProvider} from '@docknetwork/wallet-sdk-core/lib/message-provider';

const didProvider = createDIDProvider({ wallet });

const messageProvider = createMessageProvider({
  wallet,
  didProvider,
});

// This will process the messages for all the DIDs in the wallet
await messageProvider.fetchMessages();
await messageProvider.processDIDCommMessages();
```

### Full Example

```ts
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-web/lib';
import {initializeCloudWallet} from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';
import {createWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';


async function example() {
  const dataStore = await createDataStore({
    databasePath: 'dock-wallet',
    defaultNetwork: 'testnet',
  });


  const {pullDocuments} = await initializeCloudWallet({
    dataStore,
    edvUrl: EDV_URL, 
    authKey: EDV_AUTH_KEY,
    masterKey,
  });

  // Pull documents from the EDV and sync with the wallet
  await pullDocuments();

  const wallet = await createWallet({
    dataStore,
  });

  const document = {
    id: 'document-id',
    type: 'document-type',
    someData: 'any-data-you-want',
  };

  await wallet.addDocument(document);
}


example();

```

## Multi-Key Authentication

The Cloud Wallet supports multiple authentication methods to unlock the same wallet, providing both security and convenience.

### Available Authentication Methods

1. **Mnemonic-based authentication**: The traditional recovery phrase approach
2. **Biometric authentication**: Using fingerprints, facial recognition, or other biometric data
3. **Future extensions**: Can be extended to support passkeys and other authentication methods

### How Multi-Key Authentication Works

The Cloud Wallet uses a key mapping system that allows a secondary key e.g. derived from biometrics) to unlock the same master key that was originally derived from a mnemonic phrase.

#### Step 1: Generate Master Key from Mnemonic

First, generate the primary master key from a mnemonic phrase:

```ts
import { generateCloudWalletMasterKey } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';

// Generate a new wallet with mnemonic and master key
const { mnemonic, masterKey } = await generateCloudWalletMasterKey();

// IMPORTANT: Store the mnemonic securely for recovery purposes
```

#### Step 2: Create a Biometric Key

Next, generate a secondary key from biometric data. In a real implementation, this would use platform-specific secure biometric APIs:

```ts
import { deriveBiometricKey } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';

// In real implementation, this would use platform's secure biometric APIs
// This is just a simplified example
const biometricData = /* Biometric data from the platform */;
const biometricKey = await deriveBiometricKey(biometricData);
```

#### Step 3: Create Key Mapping

Create a mapping between the master key and biometric key:

```ts
import { createKeyMapping } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';

// Create the key mapping
const keyMapping = await createKeyMapping(masterKey, biometricKey);

// Store the key mapping securely
storeKeyMappingSecurely(keyMapping);
```

#### Step 4: Initialize Wallet with Different Keys

The wallet can now be initialized using either the master key or the biometric key with mapping:

```ts
// Option 1: Initialize with master key (e.g., after mnemonic recovery)
await initializeCloudWallet({
  dataStore,
  edvUrl: EDV_URL,
  authKey: EDV_AUTH_KEY,
  masterKey,
});

// Option 2: Initialize with biometric key
const storedKeyMapping = /* Load the key mapping from secure storage */;
const biometricKey = await deriveBiometricKey(biometricData);

// Recover the master key using the biometric key and mapping
const recoveredMasterKey = await recoverMasterKeyWithMapping(biometricKey, storedKeyMapping);

// Initialize with the recovered master key
await initializeCloudWallet({
  dataStore,
  edvUrl: EDV_URL,
  authKey: EDV_AUTH_KEY,
  masterKey: recoveredMasterKey,
});
```
