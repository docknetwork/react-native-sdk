import {getKeyring} from './services/keyring/service';

export const TestFixtures = {
  account1: {
    name: 'Account 1',
    mnemonic:
      'twenty fat wood hub lock cattle thought base lazy apology lyrics innocent',
    address: '393NFT43eUgKnEthAaKXnuCzizuxExMYULWrsjep5c1TmV4X',
    balance: 100,
    getKeyring: () =>
      getKeyring().addFromMnemonic(
        TestFixtures.account1.mnemonic,
        null,
        'sr25519',
      ),
  },
  account2: {
    name: 'Account 2',
    mnemonic:
      'multiply obtain exact matrix write chimney observe blind siege mobile spoon club',
    address: '38Pg2Kiod34RiWMEKNZHR6oLUahatQxaeMSfVXAGU3MbX83g',
    balance: 200,
    getKeyring: () =>
      getKeyring().addFromMnemonic(
        TestFixtures.account2.mnemonic,
        null,
        'sr25519',
      ),
  },
  noBalanceAccount: {
    name: 'Account No Balance',
    mnemonic:
      'raise genuine melt wagon make sense paddle sea human skirt lucky humor',
    address: '3AxrRtwmcmezJLv9Nj6uD6MHJY5HN4buFX1r8vyGVpJmeZmE',
    balance: 0,
    getKeyring: () =>
      getKeyring().addFromMnemonic(
        TestFixtures.noBalanceAccount.mnemonic,
        null,
        'sr25519',
      ),
  },
};
