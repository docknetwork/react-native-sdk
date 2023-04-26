import {addSchema} from '@docknetwork/wallet-sdk-wasm-services/lib/core/realm';

addSchema({
  name: 'Transaction',
  properties: {
    id: 'string',
    hash: 'string?',
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
    retrySucceeded: {
      type: 'bool',
      default: false,
    },
  },
  primaryKey: 'id',
});
