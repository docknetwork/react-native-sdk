# Dock Wallet SDK

The Dock Wallet SDK provides all the required functions to build a PolkaDot Wallet on top of a [Universal Wallet 2020](https://w3c-ccg.github.io/universal-wallet-interop-spec/) document storage. It supports both Node.js and React Native.

For React Native usage please check [@docknetwork/wallet-sdk-react-native](https://www.npmjs.com/package/@docknetwork/wallet-sdk-react-native)

This is the core package and includes basic functionalities such as:
- Manage a wallet (CRUD)
- Manage accounts (CRUD)
- Fetch account balances
- Wallet/Account backup
- Import wallet/accounts

You might require to install extra packages depending on your needs, please refer to:
- [@docknetwork/wallet-sdk-react-native](https://www.npmjs.com/package/@docknetwork/wallet-sdk-react-native)
- [@docknetwork/wallet-sdk-dids](https://www.npmjs.com/package/@docknetwork/wallet-sdk-dids)
- [@docknetwork/wallet-sdk-transactions](https://www.npmjs.com/package/@docknetwork/wallet-sdk-transactions)
- [@docknetwork/wallet-sdk-credentials](https://www.npmjs.com/package/@docknetwork/wallet-sdk-credentials)

## Installation
```js
yarn add @docknetwork/wallet-sdk-core

```


## React Native Example

```js
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';

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

```