import {Accounts} from '@docknetwork/wallet-sdk-wasm/src/modules/accounts';
import {DOCK_TOKEN_UNIT} from '@docknetwork/wallet-sdk-wasm/src/core/format-utils';
import {Transactions} from '@docknetwork/wallet-sdk-transactions/lib/transactions';

import {
  cleanup,
  closeWallet,
  createAccounts,
  createNewWallet,
  getAccounts,
  getWallet,
  setupEnvironent,
} from './helpers';
import {NetworkManager} from '@docknetwork/wallet-sdk-wasm/src/modules/network-manager';

describe('Transactions', () => {
  let wallet;
  beforeAll(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
    await createAccounts();
    wallet = await getWallet();
  });

  it('should get account balance', async () => {
    const [account1] = await getAccounts();
    const balance = await wallet.accounts.getBalance(account1.id);
    expect(balance).toEqual(0);
  });

  it('should get transaction fee', async () => {
    const [account1, account2] = await getAccounts();
    const feeAmount = await Transactions.getInstance().getFeeAmount({
      fromAddress: account1.id,
      toAddress: account2.id,
      amount: 10 * DOCK_TOKEN_UNIT,
    });

    expect(feeAmount > 0).toBeTruthy();
  });

  it('should fetch transaction history', async () => {
    NetworkManager.getInstance().setNetworkId('mainnet');
    const txModule = Transactions.getInstance();
    const accountAddress = '3HM9DYxHe5tAwh2cuErNHiLxSMDJhetxaVGCDTYXiwyuuHN6';
    await txModule.loadExternalTransactions(accountAddress);
    const transactions = await txModule.loadTransactions(accountAddress);
    console.log(`${transactions.length} Transactions fetched`);

    expect(transactions.length >= 12).toBeTruthy();

    const transaction = transactions.find(tx => tx.hash === '0x72bf313be160e6273a133ede20176e419af488d68826a478c02ff06b8db2888b');

    expect(transaction).toBeDefined();
    expect(transaction.amount).toBe(52981);
    expect(transaction.feeAmount).toBe(2.085);
  });


  afterAll(() => closeWallet());
});
