export const TokenPrice = {
  name: 'TokenPrice',
  properties: {
    symbol: 'string',
    name: 'string?',
    price: 'float',
  },
  primaryKey: 'symbol',
};

export const Account = {
  name: 'Account',
  properties: {
    id: 'string',
    name: 'string',
    balance: 'string?',
  },
  network: {
    type: 'string',
    default: 'testnet',
  },
  readyOnly: {
    type: 'bool',
    default: false,
  },
  primaryKey: 'id',
};
