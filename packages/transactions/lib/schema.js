import {addSchema} from '@docknetwork/wallet-sdk-core/lib/core/realm';

addSchema({
  name: 'Transaction',
  properties: {
    hash: 'string',
    type: {
      type: 'string',
      default: 'transfer',
    },
    error: 'string?',
    metadata: 'string?',
    date: 'date',
    fromAddress: 'string',
    recipientAddress: 'string',
    amount: 'string?',
    feeAmount: 'string',
    network: {
      type: 'string',
      default: 'testnet',
    },
    status: 'string',
    retrySucceed: {
      type: 'bool',
      default: false,
    },
  },
  primaryKey: 'hash',
});
