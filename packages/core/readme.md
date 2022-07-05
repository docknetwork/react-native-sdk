# React native SDK for Dock app

Using [polkadot-js](https://polkadot.js.org/) libraries in react native is a challange, due to a lack of WebAssembly support.

The Dock Wallet SDK handles all the Polkadot web assembly in a webview, sending messages to the react native thread through a JSON RPC layer.

All you need to do is wrap your app in a `WalletSDKProvider` and start building your Polkadot wallet.

## Installation
```js
yarn add @docknetwork/wallet-sdk-core
yarn add @docknetwork/wallet-sdk-react-native

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
          <Text>Dock Wallet SDK Demo</Text>
          <Text>Press on `add document` button to create a new account</Text>
        </Box>
        <WalletDetails />
      </WalletSDKProvider>
    </NativeBaseProvider>
  );
};

export default App;

```