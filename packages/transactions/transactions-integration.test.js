import {TestFixtures} from '@docknetwork/wallet-sdk-core/lib/fixtures';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {
  mockTransaction,
  waitFor,
} from '@docknetwork/wallet-sdk-core/lib/test-utils';
import {
  Transactions,
  AccountTransactions,
  TransactionStatus,
} from './lib/transactions';

describe('Transactions integration test', () => {
  let wallet: Wallet;
  let account: Account;
  let accountTx: AccountTransactions;
  const txInput = {
    amount: 1,
    toAddress: TestFixtures.account2.address,
  };

  jest.setTimeout(60000);

  beforeAll(async () => {
    wallet = await Wallet.create();
    account = await wallet.accounts.create(TestFixtures.account1);
    accountTx = Transactions.with(account);
  });

  it('Expect to get transaction fee', async () => {
    const feeAmount = await accountTx.getFee(txInput);
    expect(parseInt(feeAmount, 10)).toBeGreaterThan(0);
  });

  it('Expect to receive "Inability to pay fees" error', async () => {
    let error;
    try {
      const account3 = await wallet.accounts.create({name: 'no balance'});
      await Transactions.with(account3).send(txInput);
    } catch (err) {
      error = err.toString();
    }

    expect(error).toContain(
      'Error: 1010: Invalid Transaction: Inability to pay some fees',
    );

    // TODO: Check transaction history
  });

  it('Expect to receive "Balance too low" error', async () => {
    let error;
    try {
      await accountTx.send({
        ...txInput,
        amount: DOCK_TOKEN_UNIT * 100000000,
      });
    } catch (err) {
      console.log(err);
      error = err.toString();
    }

    expect(error).toContain(
      'Error: balances.InsufficientBalance:  Balance too low to send value',
    );

    // TODO: Check transaction history
  });

  it('Expect to send transaction (complete)', async () => {
    const hash = '0x1234';
    const delay = 300;
    mockTransaction({
      hash,
      delay,
    });

    const result = await accountTx.send(txInput);

    expect(result).toBe(hash);

    const items = await accountTx.getTransactions();
    expect(items.length).toBe(1);
    let txItem = await accountTx.transactions.getByHash(hash);
    expect(txItem).toBeDefined();
    expect(txItem.status).toBe(TransactionStatus.InProgress);

    await waitFor(delay * 2);

    txItem = await accountTx.transactions.getByHash(hash);

    expect(txItem).toBeDefined();
    expect(parseFloat(txItem.amount)).toBe(txInput.amount);
    expect(txItem.recipientAddress).toBe(txInput.toAddress);
    expect(txItem.status).toBe(TransactionStatus.Complete);
  });

  it('Expect to send transaction (failed)', async () => {
    const hash = '0x1234';
    const delay = 300;
    const error = 'Some error';

    mockTransaction({
      hash,
      delay,
      error,
    });

    const result = await accountTx.send(txInput);

    expect(result).toBe(hash);

    const items = await accountTx.getTransactions();
    expect(items.length).toBe(1);
    let txItem = await accountTx.transactions.getByHash(hash);
    expect(txItem).toBeDefined();
    expect(txItem.status).toBe(TransactionStatus.InProgress);

    await waitFor(delay * 2);

    txItem = await accountTx.transactions.getByHash(hash);

    expect(txItem).toBeDefined();
    expect(parseFloat(txItem.amount)).toBe(txInput.amount);
    expect(txItem.recipientAddress).toBe(txInput.toAddress);
    expect(txItem.status).toBe(TransactionStatus.Failed);
    expect(txItem.error).toBe(error);
    expect(txItem.retrySucceed).toBeFalsy();
  });
});
