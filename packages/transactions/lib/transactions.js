import {ApiRpc} from '../client/api-rpc';
import uuid from 'uuid';
import {getRealm} from '../core/realm';
import {DOCK_TOKEN_UNIT} from '../core/format-utils';
import {fetchTransactions} from '../core/subscan';
import BigNumber from 'bignumber.js';
import {Accounts} from './accounts';
import {NetworkManager} from './network-manager';

export const TransactionStatus = {
  InProgress: 'pending',
  Failed: 'failed',
  Complete: 'complete',
};

/**
 * Transactions Module
 */
export class Transactions {
  constructor() {
    this.transactions = [];
  }

  /**
   * Get transactions module instance
   * @returns module instance
   */
  static getInstance() {
    if (!Transactions.instance) {
      Transactions.instance = new Transactions();
    }

    return Transactions.instance;
  }

  /**
   * Load external transactions for the given account
   *
   * @param {string} account
   */
  async loadExternalTransactions(account) {
    const realm = getRealm();
    const dbTransactions = realm.objects('Transaction').toJSON();

    const handleTransaction = tx => {
      if (tx.from !== account && tx.to !== account) {
        return;
      }

      if (dbTransactions.find(item => item.hash === tx.hash)) {
        return;
      }

      const newTx = {
        amount: BigNumber(tx.amount).times(DOCK_TOKEN_UNIT).toString(),
        feeAmount: tx.fee,
        recipientAddress: tx.to,
        fromAddress: tx.from,
        id: tx.hash,
        hash: tx.hash,
        network: 'mainnet',
        status: 'complete',
        date: new Date(parseInt(tx.block_timestamp + '000', 10)),
      };

      realm.write(() => {
        realm.create('Transaction', newTx, 'modified');
      });
    };

    let data;
    let page = 0;

    do {
      data = await fetchTransactions({address: account, page});
      data.transfers.forEach(handleTransaction);
      page++;
    } while (data.hasNextPage);
  }

  /**
   * Load transactions for the current accounts
   *
   * @returns transactions
   */
  async loadTransactions() {
    const realm = getRealm();
    const networkId = NetworkManager.getInstance().networkId;

    if (networkId === 'mainnet') {
      const accounts = Accounts.getInstance().getAccounts();

      for (const account of accounts) {
        try {
          this.loadExternalTransactions(account.id);
        } catch (err) {
          console.error(err);
        }
      }
    }

    let items = realm.objects('Transaction').toJSON();

    if (networkId === 'mainnet') {
      items = items.filter(item => !(item.status === 'complete' && !item.hash));
    }

    return items;
  }

  /**
   * Update transaction
   *
   * @param {*} transaction
   */
  updateTransaction(transaction) {
    const realm = getRealm();

    realm.write(() => {
      realm.create('Transaction', transaction, 'modified');
    });
  }

  /**
   * Get fee amount for the transaction
   * @param {*} param0
   * @returns {int} fee amount
   */
  getFeeAmount({recipientAddress, accountAddress, amount}) {
    return ApiRpc.getFeeAmount({
      recipientAddress: recipientAddress,
      accountAddress,
      amount: amount,
    });
  }

  /**
   * Send transaction
   * @param {*} param0
   */
  sendTransaction({
    recipientAddress,
    accountAddress,
    amount,
    fee,
    prevTransaction,
  }) {
    const parsedAmount = parseFloat(amount) * DOCK_TOKEN_UNIT;

    const internalId = uuid();
    const transaction = {
      id: internalId,
      date: new Date().toISOString(),
      fromAddress: accountAddress,
      recipientAddress: recipientAddress,
      amount: `${parsedAmount}`,
      feeAmount: `${fee}`,
      status: TransactionStatus.InProgress,
    };

    const realm = getRealm();

    realm.write(() => {
      realm.create('Transaction', transaction, 'modified');
    });

    this.transactions.push(transaction);

    return ApiRpc.sendTokens({
      recipientAddress,
      accountAddress,
      amount: parsedAmount,
    })
      .then(res => {
        const updatedTransation = {
          ...transaction,
          status: TransactionStatus.Complete,
        };
        this.updateTransaction(updatedTransation);

        realm.write(() => {
          realm.create('Transaction', updatedTransation, 'modified');
        });

        if (
          prevTransaction &&
          prevTransaction.status === TransactionStatus.Failed
        ) {
          this.updateTransaction({
            ...prevTransaction,
            retrySucceed: true,
          });
        }
      })
      .catch(err => {
        console.error(err);

        const updatedTransation = {
          ...transaction,
          status: TransactionStatus.Failed,
        };

        realm.write(() => {
          realm.create('Transaction', updatedTransation, 'modified');
        });

        this.updateTransaction(updatedTransation);

        throw new Error('transaction_failed');
      });
  }
}
