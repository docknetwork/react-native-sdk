# React native SDK for Dock app

Using [polkadot-js](https://polkadot.js.org/) libraries in react native is a challange, due to a lack of webassembly support.

The Dock Wallet SDK handles all the Polkadot web assembly in a webview, sending messages to the react native thread trough a JSON RPC layer.

All you need to do is wrap your app in a `WalletSDKProvider` and start building your Polkadot wallet.

## Dependencies
1. Install @react-native-async-storage/async-storage
2. Nodify react native project using this steps
https://nicedoc.io/tradle/rn-nodeify


## Installation
```js
yarn add @docknetwork/wallet-sdk-core
yarn add @docknetwork/wallet-sdk-react-native
yarn add @docknetwork/wallet-sdk-transactions

```


## React Native Example
The following example will create a wallet and allow the user to add accounts on it. Displaying the count of documents added to the wallet.

Notice that the account documents are accessible through the `documents` object, and for each account created multiple documents will be added to the wallet.

```js
import {Box, Button, NativeBaseProvider, Text} from 'native-base';
import React, {useEffect} from 'react';
import {
  WalletSDKProvider,
  useWallet,
} from '@docknetwork/wallet-sdk-react-native/lib';

const WalletDetails = function () {
  const {wallet, status, documents} = useWallet();

  return (
    <Box>
      <Text>Wallet status: {status}</Text>
      <Text>Wallet docs: {documents.length}</Text>
      <Button onPress={() => wallet.accounts.create({name: 'test'})}>
        <Text>Add Account</Text>
      </Button>
    </Box>
  );
};

const App = () => {
  return (
    <NativeBaseProvider>
      <WalletSDKProvider>
        <Box p={8}>
          <Text>SDK Demo</Text>
          <Text>Press on `add document` button to create a new account</Text>
        </Box>
        <WalletDetails />
      </WalletSDKProvider>
    </NativeBaseProvider>
  );
};

export default App;

```

## Using the wallet module

```js
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {Transactions} from '@docknetwork/wallet-sdk-transactions/lib/transactions';

const wallet = await Wallet.create();

const account1 = await wallet.accounts.create({
  name: 'test',
});

console.log(`Account1 address ${account1.address}`);
// result: Account1 address 3D1M9UnR684eBfVujjQr6ucPqvXERSxYxcVBFGAhRohhRXxq

// Create account using an existing mnemonic
const mnemonic =
  'indicate mention thing discover clarify grief inherit vivid dish health market spoil';
const account2 = await wallet.accounts.create({
  name: 'Test',
  mnemonic,
});

console.log(`Account2 address ${account2.address}`);

// result: Account2 address 3FENesfZgFmBruv2H9Hc17GmobeTfxFAp8gHKXFmUtA38hcW

// Fetch accounts balance
const balance = await account1.getBalance();

console.log('Account1 balance', balance);

// result: Account1 balance 0

// Handle transactions
const transactions = Transactions.with(account1);

const txInput = {
  toAddress: account2.address,
  amount: 3
};

// Get transaction fee in DOCK tokens
const fee = await transactions.getFee(txInput);

console.log('Transaction fee', fee);

// result: Transaction fee 2.3

// Send transaction
const hash = await transactions.send(txInput);

console.log('Transaction hash', fee);

// result: Transaction hash 0x1c1c5ca40acafb830460dccb492be4ac7181e9d700ab78853df052e478e8b2a9

```

## Running on nodejs

Check the following repository for nodejs project examples.

https://github.com/docknetwork/wallet-sdk-examples


## Docs

https://docknetwork.github.io/react-native-sdk/
