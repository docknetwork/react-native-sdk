# React native sdk for dock app

Handles polkadot-js and provides webassembly support 

## React Native Example

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

## Using the wallet module

```js
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {Transactions} from '@docknetwork/wallet-sdk-transactions/lib/transactions';

const wallet = await Wallet.create();

const account1 = await wallet.accounts.create({
  name: 'test',
});

console.log(`Account1 address ${account1.address}`);

// Create account using an existing mnemonic
const mnemonic =
  'indicate mention thing discover clarify grief inherit vivid dish health market spoil';
const account2 = await wallet.accounts.create({
  name: 'Test',
  mnemonic,
});

console.log(`Account2 address ${account2.address}`);

// Fetch accounts balance
const balance = await account1.getBalance();

console.log('Account1 balance', balance);

// Handle transactions
const transactions = Transactions.with(account1);

const txInput = {
  toAddress: account2.address,
  amount: 3
};

// Get transaction fee
const fee = await transactions.getFee(txInput);

console.log('Transaction fee', fee);

// Send transaction
const hash = await transactions.send(txInput);

console.log('Transaction hash', fee);

```
## Docs

https://docknetwork.github.io/react-native-sdk/
