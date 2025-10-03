# Truvera Wallet SDK

The [Wallet SDK](https://github.com/docknetwork/wallet-sdk) enables you to build a Verifiable Credentials wallet inside your app and allows your users to receive, store, and manage their DOCK tokens too. This was built for mobile applications with added support for Polkadot-JS.

To use the wallet-sdk, all you need to do is wrap your app in a `WalletSDKProvider` and start building your wallet.

Using [polkadot-js](https://polkadot.js.org/) libraries in React Native is a challenge, due to the lack of WebAssembly support.
The Truvera Wallet SDK handles all the Polkadot Web Assembly in a WebView, sending messages to the React Native thread through a JSON RPC layer.

Truvera Mobile SDK supports:
- Devices that have Android 8.1 or higher and iOS 11 or higher.
- Minimum supported version of Node.js is 20.2.0

## Installation
```js
yarn add @docknetwork/wallet-sdk-core
yarn add @docknetwork/wallet-sdk-react-native

```
**There are some scripts and additional dependencies required.**
Please check our [examples](/examples) folder for detailed steps.

## React Native Example
The following example will create a wallet and allow the user to add credentials to it. Displaying the count of documents added to the wallet.
Notice that the all documents are accessible through the `documents` object.

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
      <Button onPress={() => wallet.addDocument({
        name: 'my credential',
        type: 'VerifiableCredential',
      })}>
        <Text>Add Credential</Text>
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
          <Text>Press on `add credential` button to create a new credential</Text>
        </Box>
        <WalletDetails />
      </WalletSDKProvider>
    </NativeBaseProvider>
  );
};

export default App;

```

## Running on other platforms

Check the following repository for detailed examples for running the Truvera Wallet SDK on NodeJS, Web, and Flutter.

[See the examples](https://github.com/docknetwork/wallet-sdk/tree/master/examples)


## Docs

For more details you can check the [getting started guide](https://github.com/docknetwork/wallet-sdk/blob/master/docs/getting-started.md)

[See the Github repository](https://docknetwork.github.io/wallet-sdk/)

## Features
- [Biometric Plugin](https://github.com/docknetwork/wallet-sdk/blob/master/docs/biometric-plugin.md)
- [Ecosystem Tools](https://github.com/docknetwork/wallet-sdk/blob/master/docs/ecosystem-tools.md)
- [Cloud Wallet](https://github.com/docknetwork/wallet-sdk/blob/master/docs/cloud-wallet.md)