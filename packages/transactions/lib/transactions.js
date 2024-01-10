import assert from 'assert';
import {DOCK_TOKEN_UNIT} from '@docknetwork/wallet-sdk-wasm/src/core/format-utils';
import BigNumber from 'bignumber.js';
import {Accounts} from '@docknetwork/wallet-sdk-wasm/src/modules/accounts';
import {Account} from '@docknetwork/wallet-sdk-wasm/src/modules/account';
import {substrateService} from '@docknetwork/wallet-sdk-wasm/src/services/substrate';
import {NetworkManager} from '@docknetwork/wallet-sdk-wasm/src/modules/network-manager';
import {getRpcEventEmitter} from '@docknetwork/wallet-sdk-wasm/src/events';
import {TransactionDetails} from './transaction';
import {fetchTransactions} from '@docknetwork/wallet-sdk-wasm/src/core/subscan';
import {
  isAddressValid,
  isNumberValid,
} from '@docknetwork/wallet-sdk-wasm/src/core/validation';
import {Wallet} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import { getLocalStorage } from '@docknetwork/wallet-sdk-data-store/src';

export const TransactionStatus = {
  InProgress: 'pending',
  Failed: 'failed',
  Complete: 'complete',
};

export type TransactionInput = {
  fromAddress?: string,
  toAddress: string,
  amount: string,
};

export class AccountTransactions {
  account: Account;
  transactions: Transactions;

  constructor(account: Account, transactions?: Transactions) {
    assert(!!account, 'account is required');
    assert(
      account instanceof Account,
      'account must be an instance of Account',
    );

    this.account = account;
    this.transactions = transactions || Transactions.getInstance();
  }

  static create(
    account: Account,
    transactions?: Transactions,
  ): AccountTransactions {
    return new AccountTransactions(account, transactions);
  }

  getTxInput({toAddress, amount}) {
    const result = {
      fromAddress: this.account.address,
      toAddress,
      amount,
    };

    return result;
  }

  getFee({toAddress, amount}) {
    return this.transactions.getFeeAmount(
      this.getTxInput({
        toAddress,
        amount,
      }),
    );
  }

  async send({toAddress, amount}) {
    return this.transactions.send(
      this.getTxInput({
        toAddress,
        amount,
      }),
    );
  }

  async getTransactions(): Promise<TransactionDetails[]> {
    const items = await getAllTransactions();

    return items.filter(item => item.fromAddress === this.account.address || item.recipientAddress === this.account.address);
  }
}

export const TransactionEvents = {
  added: 'transaction-added',
  updated: 'transaction-updated',
};


async function getAllTransactions() {
  try {
    const data = await getLocalStorage().getItem('transactions');
    return JSON.parse(data) || [];
  } catch (err) {
    return [];
  }
}

async function addTransaction(transaction) {
  try {
    const data = await getAllTransactions();
    data.push(transaction);
    await getLocalStorage().setItem('transactions', JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

async function upsertTransaction(transaction) {
  try {
    const data = await getAllTransactions();
    const index = data.findIndex(item => item.id === transaction.id);
    if (index > -1) {
      data[index] = transaction;
    } else {
      data.push(transaction);
    }
    await getLocalStorage().setItem('transactions', JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

async function removeTransaction(transactionId) {
  try {
    const data = await getAllTransactions();
    const index = data.findIndex(item => item.id === transactionId);
    if (index > -1) {
      data.splice(index, 1);
    }
    await getLocalStorage().setItem('transactions', JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

/** Transactions */
export class Transactions {
  constructor(accounts: Accounts) {
    this.accounts = accounts || Accounts.getInstance();
    this.wallet = this.accounts.wallet;
    this.eventManager = this.wallet.eventManager;
  }

  /**
   * Get transactions module instance
   * @returns module instance
   */
  static getInstance(): Transactions {
    if (!Transactions.instance) {
      Transactions.instance = new Transactions();
    }

    return Transactions.instance;
  }

  static with(account: string | Account): AccountTransactions {
    assert(!!account, 'account is required');

    if (typeof account === 'string') {
      assert(isAddressValid(account), 'invalid account address');

      account = Account.with(account);
    }

    return AccountTransactions.create(account);
  }

  remove(transactionId) {
    return removeTransaction(transactionId);
  }

  getByHash(hash): Promise<TransactionDetails> {
    assert(!!hash, 'hash is required');

    return getLocalStorage()
      .objects('Transaction')
      .filtered('hash = $0', hash)
      .toJSON()[0];
  }

  async getByAccount(address): Promise<TransactionDetails> {
    assert(isAddressValid(address), 'invalid account address');
    const items = await getAllTransactions()

    return items.filter(item => item.fromAddress === address || item.recipientAddress === address);
  }

  getAll(): Promise<TransactionDetails> {
    return getAllTransactions();
  }

  /**
   * Load external transactions for the given account
   *
   * @param {string} address
   */
  async loadExternalTransactions(address) {
    assert(isAddressValid(address), 'invalid address');

    const networkId = NetworkManager.getInstance().networkId;

    if (networkId !== 'mainnet') {
      return;
    }

    let dbTransactions = await getAllTransactions();

    if (!dbTransactions) {
      dbTransactions = [];
    }

    const handleTransaction = tx => {
      if (tx.from !== address && tx.to !== address) {
        return;
      }
      if (dbTransactions.find(item => item.hash === tx.hash)) {
        return;
      }
      const newTx = {
        amount: tx.amount,
        feeAmount: tx.fee,
        recipientAddress: tx.to,
        fromAddress: tx.from,
        id: tx.hash,
        hash: tx.hash,
        network: NetworkManager.getInstance().networkId,
        status: 'complete',
        date: new Date(parseInt(tx.block_timestamp + '000', 10)),
      };
      addTransaction(newTx);
    };
    let data;
    let page = 0;
    do {
      try {
        data = await fetchTransactions({address, page});
        data.items.forEach(handleTransaction);
        Wallet.getInstance().eventManager.emit(
          TransactionEvents.added,
          address,
        );
        page++;
      } catch (err) {
        console.error(err);
      }
    } while (data.hasNextPage);
  }

  /**
   * Load transactions for the current accounts
   *
   * @returns transactions
   */
  async loadTransactions(address: string) {
    const items = await getAllTransactions();

    return items.filter(item => {
      return item.fromAddress === address || item.recipientAddress === address
    });
  }

  /**
   * Update transaction
   *
   * @param {*} transaction
   */
  updateTransaction(transaction) {
    assert(!!transaction, 'transaction is required');

    return upsertTransaction(transaction);
  }

  /**
   * Get fee amount for the transaction
   * @param {*} param0
   * @returns {int} fee amount
   */
  async getFeeAmount({fromAddress, toAddress, amount}) {
    assert(isAddressValid(toAddress), 'invalid toAddress');
    assert(isAddressValid(fromAddress), 'invalid fromAddress');
    assert(isNumberValid(amount), 'invalid amount');

    await this.wallet.ensureNetwork();

    const keyPair = await this.wallet.getAccountKeyPair(fromAddress);
    const fee = await substrateService.getFeeAmount({
      fromAddress: fromAddress,
      toAddress,
      amount,
      keyPair,
    });

    return BigNumber(fee).dividedBy(DOCK_TOKEN_UNIT).toNumber();
  }

  /**
   * Send transaction
   * @param {*} param0
   */
  async send({toAddress, fromAddress, amount, fee, prevTxHash}) {
    assert(isAddressValid(toAddress), 'invalid toAddress');
    assert(isAddressValid(fromAddress), 'invalid fromAddress');
    assert(isNumberValid(amount), 'invalid amount');

    if (fee) {
      assert(isNumberValid(fee), 'invalid fee amount');
    }

    const amountUnits = parseFloat(amount) * DOCK_TOKEN_UNIT;

    await this.wallet.ensureNetwork();

    const keyPair = this.wallet.getAccountKeyPair(fromAddress);
    const hash = await substrateService.sendTokens({
      toAddress,
      fromAddress,
      amount: amountUnits,
      keyPair,
    });

    const emitter = getRpcEventEmitter();

    const transaction = {
      hash,
      date: new Date().toISOString(),
      fromAddress: fromAddress,
      recipientAddress: toAddress,
      amount: `${amount}`,
      feeAmount: `${fee}`,
      status: TransactionStatus.InProgress,
      network: NetworkManager.getInstance().networkId,
    };

    await upsertTransaction(transaction);

    emitter.on(`${hash}-complete`, () => {
      upsertTransaction({
        ...transaction,
        status: TransactionStatus.Complete,
      })
    });

    emitter.on(`${hash}-failed`, error => {
      upsertTransaction({
        ...transaction,
        status: TransactionStatus.Failed,
        error,
      });
    });

    return hash;
  }
}
