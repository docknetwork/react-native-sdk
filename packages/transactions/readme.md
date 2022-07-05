
# Transactions Manager

Transactions manager for the dock wallet sdk

On react native it's required to set up the WalletSDKProvider, described on [@docknetwork/wallet-sdk-react-native](https://www.npmjs.com/package/@docknetwork/wallet-sdk-react-native)

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

