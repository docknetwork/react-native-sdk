
# Transactions Manager

Transactions are required to send and receive (DOCK Tokens)[[https://www.dock.io/token]. This module handles the transaction history and provie methods to send DOCK tokens to any address.

The Dock utility token (DOCK) plays a key role in aligning incentives across all of the Dock network’s participants including issuers, validators, token holders, and the Dock Association, and ensures collaboration and growth. Learn more (here)[https://www.dock.io/token]

On React Native it's required to set up the WalletSDKProvider, described on [@docknetwork/wallet-sdk-react-native](https://www.npmjs.com/package/@docknetwork/wallet-sdk-react-native)

```js
import {Transactions} from '@docknetwork/wallet-sdk-transactions/lib/transactions';


const transactionsManager = Transactions.getInstance();

// get all transactions for a given address
const items = await transactionsManager.loadTransactions(accountAddress;


// Get transaction fee
const feeAmount = await transactionsManager.getFeeAmount({
    fromAddress: '3CH1Ce5k516MNoyJvRbq4CtuiSDisa8SF9JBqCcSYRAEzgUk'
    toAddress: '36j7be6fP7ad78zGAU5XcPa77AmuWYzaWFkUhiKHYmzW35A6'
    amount: 1
});

// Send tokens
const hash = await transactionsManager.send({
    fromAddress: '3CH1Ce5k516MNoyJvRbq4CtuiSDisa8SF9JBqCcSYRAEzgUk'
    toAddress: '36j7be6fP7ad78zGAU5XcPa77AmuWYzaWFkUhiKHYmzW35A6'
    amount: 1
});
```

