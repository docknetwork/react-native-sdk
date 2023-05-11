import './schema';
import assert from 'assert';
import {DOCK_TOKEN_UNIT} from '@docknetwork/wallet-sdk-wasm/lib/core/format-utils';
import BigNumber from 'bignumber.js';
import {Accounts} from '@docknetwork/wallet-sdk-wasm/lib/modules/accounts';
import {Account} from '@docknetwork/wallet-sdk-wasm/lib/modules/account';
import {substrateService} from '@docknetwork/wallet-sdk-wasm/lib/services/substrate';
import {NetworkManager} from '@docknetwork/wallet-sdk-wasm/lib/modules/network-manager';
import {getRealm} from '@docknetwork/wallet-sdk-wasm/lib/core/realm';
import {getRpcEventEmitter} from '@docknetwork/wallet-sdk-wasm/lib/events';
import {TransactionDetails} from './transaction';
import {fetchTransactions} from '@docknetwork/wallet-sdk-wasm/lib/core/subscan';
import {
  isAddressValid,
  isNumberValid,
} from '@docknetwork/wallet-sdk-wasm/lib/core/validation';
import {Wallet} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';

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
    return getRealm()
      .objects('Transaction')
      .filtered(
        'fromAddress = $0 or recipientAddress = $0',
        this.account.address,
      )
      .toJSON();
  }
}

export const TransactionEvents = {
  added: 'transaction-added',
  updated: 'transaction-updated',
};

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

  getByHash(hash): Promise<TransactionDetails> {
    assert(!!hash, 'hash is required');

    return getRealm()
      .objects('Transaction')
      .filtered('hash = $0', hash)
      .toJSON()[0];
  }

  getByAccount(address): Promise<TransactionDetails> {
    assert(isAddressValid(address), 'invalid account address');

    return getRealm()
      .objects('Transaction')
      .filtered('fromAddress = $0 or recipientAddress = $0', address)
      .toJSON();
  }

  getAll(): Promise<TransactionDetails> {
    return getRealm().objects('Transaction').toJSON();
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

    const realm = getRealm();
    const dbTransactions = realm.objects('Transaction');

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
      realm.write(() => {
        realm.create('Transaction', newTx, 'modified');
      });
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
    const realm = getRealm();

    return realm
      .objects('Transaction')
      .filtered(
        `(status == "${TransactionStatus.Complete}" AND hash !="") OR (status !="${TransactionStatus.Complete}")`,
      )
      .filtered(
        `fromAddress == "${address}" OR recipientAddress == "${address}"`,
      )
      .sorted('date', true)
      .toJSON();
  }

  /**
   * Update transaction
   *
   * @param {*} transaction
   */
  updateTransaction(transaction) {
    assert(!!transaction, 'transaction is required');

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
  async getFeeAmount({fromAddress, toAddress, amount}) {
    assert(isAddressValid(toAddress), 'invalid toAddress');
    assert(isAddressValid(fromAddress), 'invalid fromAddress');
    assert(isNumberValid(amount), 'invalid amount');

    await this.wallet.ensureNetwork();

    const fee = await substrateService.getFeeAmount({
      fromAddress: fromAddress,
      toAddress,
      amount,
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

    const hash = await substrateService.sendTokens({
      toAddress,
      fromAddress,
      amount: amountUnits,
    });

    const realm = getRealm();
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

    realm.write(() => {
      realm.create('Transaction', transaction, 'modified');
    });

    emitter.on(`${hash}-complete`, () => {
      realm.write(() => {
        realm.create(
          'Transaction',
          {
            ...transaction,
            status: TransactionStatus.Complete,
          },
          'modified',
        );
      });
    });

    emitter.on(`${hash}-failed`, error => {
      realm.write(() => {
        realm.create(
          'Transaction',
          {
            ...transaction,
            status: TransactionStatus.Failed,
            error,
          },
          'modified',
        );
      });
    });

    return hash;
  }
}
