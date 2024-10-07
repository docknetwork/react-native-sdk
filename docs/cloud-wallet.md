Here is an improved version of your documentation, with clearer instructions and a more concise description:

---

# Cloud Wallet Documentation

The Cloud Wallet feature allows secure storage and synchronization of wallet documents via an [Encrypted Data Vault (EDV)](https://digitalbazaar.github.io/encrypted-data-vaults/).

**File Path:** `@docknetwork/wallet-sdk-core/src/cloud-wallet`

## Feature Overview

The Cloud Wallet integrates with an [Encrypted Data Vault (EDV)](https://digitalbazaar.github.io/encrypted-data-vaults/) to securely store, sync, and manage documents. Once initialized, it automatically synchronizes documents between the EDV and the wallet, allowing you to add, update, remove, without dealing with the synchronization logic.

## Usage Example

The example below demonstrates how to initialize and use the Cloud Wallet for managing documents.

### Step 1: Import Required Functions

Ensure you import the necessary SDK functions to interact with the Cloud Wallet:

```ts
import {initializeCloudWallet} from '@docknetwork/wallet-sdk-core/src/cloud-wallet';
import {createWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {edvService} from '@docknetwork/wallet-sdk-wasm/src/services/edv';
```

### Step 2: Initialize the Data Store

#### For Mobile and Node.js

```ts
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-typeorm/src';

const dataStore = await createDataStore({
  databasePath: 'dock-wallet',
  dbType: 'sqlite',
  defaultNetwork: 'testnet',
});
```

#### For Browser

```ts
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-web/src';

const dataStore = await createDataStore({
  databasePath: 'dock-wallet',
  defaultNetwork: 'testnet',
});
```

### Step 3: Generate Wallet Keys

Use the same Cloud Wallet keys across multiple devices to access the same documents. These keys are used to encrypt, decrypt, and locate documents in the EDV.

```ts
const {verificationKey, agreementKey, hmacKey} = await edvService.generateKeys();
```

The key generation returns an object with `agreementKey`, `verificationKey`, and `hmacKey`. You will use these keys to initialize the Cloud Wallet.

### Step 4: Initialize the Cloud Wallet

After setting up the data store and generating keys, initialize the Cloud Wallet. This ensures continuous synchronization between the EDV and the wallet.

```ts
const {pullDocuments} = await initializeCloudWallet({
  dataStore,
  edvUrl: EDV_URL,
  agreementKey,
  verificationKey,
  hmacKey,
  authKey: EDV_AUTH_KEY,
});

// Pull documents from the EDV and sync with the wallet
await pullDocuments();
```

The `pullDocuments` function synchronizes the EDV and the wallet by comparing documents and updating the data store accordingly.

### Step 5: Create a New Wallet

Now, create a wallet to manage your documents. This will allow you to add, update, and remove documents.

```ts
const wallet = await createWallet({
  dontWaitForNetwork: true,
  dataStore,
});
```

### Step 6: Add a Document to the Wallet

You can add a document to the wallet using the following code:

```ts
const document = {
  id: 'document-id',
  someData: 'any-data-you-want',
};

await wallet.addDocument(document);
```
