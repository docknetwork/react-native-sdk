# Dock Wallet SDK for React Native

Using [polkadot-js](https://polkadot.js.org/) libraries in React Native is a challenge, due to a lack of WebAssembly support.

The Dock Wallet SDK handles all the Polkadot Web Assembly in a WebView, sending messages to the React Native thread through a JSON RPC layer.

All you need to do is wrap your app in a `WalletSDKProvider` and start building your Polkadot wallet.

You will have to install https://www.npmjs.com/package/nodeify in your project

```js
import {Box, Button, NativeBaseProvider, Text} from 'native-base';
import React, {useEffect} from 'react';
import {
  WalletSDKProvider,
  useWallet,
  useAccount
} from '@docknetwork/wallet-sdk-react-native/lib';


// Wallet SDK Provider (required)
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

// useWallet hook
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

// useAccount hook
const AccountDetails = function ({ address }) {
  const {account, fetchBalance} = useAccount(address);

  return (
    <Box>
      <Text>Address: {account.address}</Text>
      <Text>Name: {account.name}</Text>
      <Text>Balance: {account.balance}</Text>
      <Button onPress={fetchBalance}>
        <Text>Refresh</Text>
      </Button>
    </Box>
  );
};

``