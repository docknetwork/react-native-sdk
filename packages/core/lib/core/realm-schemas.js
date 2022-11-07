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

export const RequestLog = {
  name: 'RequestLog',
  properties: {
    id: 'string',
    url: 'string',
    status: 'int',
    method: 'string',
    headers: 'string',
    body: 'string',
    response: 'string',
    createdAt: 'date',
  },
  primaryKey: 'id',
};
