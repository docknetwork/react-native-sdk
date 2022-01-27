# React native sdk for dock app

Handles polkadot-js and provides webassembly support 

## React Native Example

```js
import {Box, Button, NativeBaseProvider, Text} from 'native-base';
import React, {useEffect} from 'react';
import {
  WalletSDKProvider,
  useWallet,
} from '@docknetwork/wallet-sdk-react-native/lib/index';

const WalletDetails = function () {
  const {wallet, status, documents} = useWallet();

  return (
    <Box>
      <Text>Wallet status: {status}</Text>
      <Text>Wallet docs: {documents.length}</Text>
      <Button onPress={() => wallet.accounts.create({name: 'test'})}>
        <Text>Add document</Text>
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
          <Text>Test</Text>
        </Box>
        <WalletDetails />
      </WalletSDKProvider>
    </NativeBaseProvider>
  );
};

export default App;

```
## Docs

https://docknetwork.github.io/react-native-sdk/

## TODO

- realm storage for wallet documents
- secure document storage