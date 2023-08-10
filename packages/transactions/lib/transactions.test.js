import {TransactionStatus, Transactions} from './transactions';
import {getRealm, initRealm} from '@docknetwork/wallet-sdk-wasm/src/core/realm';

const initMockTransactions = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return [
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '0',
      hash: null,
      network: 'testnet',
      status: TransactionStatus.Complete,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '1',
      hash: null,
      network: 'testnet',
      status: TransactionStatus.InProgress,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '2',
      hash: null,
      network: 'testnet',
      status: TransactionStatus.Failed,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '3',
      hash: '',
      network: 'testnet',
      status: TransactionStatus.Complete,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '4',
      hash: '',
      network: 'testnet',
      status: TransactionStatus.InProgress,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '5',
      hash: '',
      network: 'testnet',
      status: TransactionStatus.Failed,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },

    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '6',
      hash: '0xa3b3bf9d13dd726c1e0051d48cb99fd05e79442b2cda05374e898351c3ade9c2',
      network: 'testnet',
      status: TransactionStatus.Complete,
      date: new Date('2022-03-01T17:52:03.741Z'),
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '7',
      hash: '0xc3b3bf9d13dd726c1e0051d48cb99fd05e79442b2cda05374e898351c3ade9c2',
      network: 'testnet',
      status: TransactionStatus.InProgress,
      date: yesterday,
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB',
      id: '8',
      hash: '0xb3b3bf9d13dd726c1e0051d48cb99fd05e79442b2cda05374e898351c3ade9c2',
      network: 'testnet',
      status: TransactionStatus.Failed,
      date: today,
    },
    {
      amount: '10',
      feeAmount: '1',
      recipientAddress: '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsBWrong',
      fromAddress: '4C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsBWrong',
      id: '9',
      hash: '0xb3b3bf9d13dd726c1e0051d48cb99fd05e79442b2cda05374e898351c3ade9c2',
      network: 'testnet',
      status: TransactionStatus.Failed,
      date: today,
    },
  ];
};

describe('TransactionsModule', () => {
  describe('Transactions history', () => {
    let realm;
    beforeAll(async () => {
      await initRealm();
      realm = getRealm();
      await realm.write(() => {
        for (const tx of initMockTransactions()) {
          realm.create('Transaction', tx, 'modified');
        }
      });
    });

    it('expect to filter only transactions for the given address', async () => {
      const accountAddress = '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB';
      const transactions = await Transactions.getInstance().loadTransactions(
        accountAddress,
      );

      expect(transactions.length).toEqual(8);
    });

    it('Is history filtered (received transactions with null/undefined hash)', async () => {
      const accountAddress = '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB';
      const transactions = await Transactions.getInstance().loadTransactions(
        accountAddress,
      );

      expect(transactions.length).toEqual(8);
    });

    it('Is history sorted in desc', async () => {
      const accountAddress = '3C7Hq5jQGxeYzL7LnVASn48tEfr6D7yKtNYSuXcgioQoWWsB';
      const transactions = await Transactions.getInstance().loadTransactions(
        accountAddress,
      );
      expect(transactions[0].id).toEqual('8');
      expect(transactions[1].id).toEqual('7');
      expect(transactions[2].id).toEqual('0');
    });
  });
});
