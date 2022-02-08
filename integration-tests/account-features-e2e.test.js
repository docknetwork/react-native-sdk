import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import { mockDockSdkConnection, mockDockService } from '@docknetwork/wallet-sdk-core/lib/services/test-utils';
import {Transactions} from '@docknetwork/wallet-sdk-transactions/lib/transactions';

describe('Wallet integration test', () => {
  let wallet: Wallet;

  it('Create wallet + add accounts + get account balance + get transaction fee', async () => {
    const resetSdkMock = await mockDockService();

    wallet = await Wallet.create();


    await wallet.ensureNetwork();
    
    const account1 = await wallet.accounts.create({
      name: 'test',
    });

    console.log(`Account1 address ${account1.address}`);

    // Create account with existing mnemonic
    const mnemonic =
      'indicate mention thing discover clarify grief inherit vivid dish health market spoil';
    const account2 = await wallet.accounts.create({
      name: 'Test',
      mnemonic,
    });

    console.log(`Account2 address ${account2.address}`);

    // Fetch accounts balance
    const balance = await account1.getBalance();

    console.log('Account balance', balance);

    // Working with transactions
    const transactions = Transactions.with(account1);

    const txInput = {
      toAddress: account2.address,
      amount: 3,
    };

    // Get transaction fee
    const fee = await transactions.getFee(txInput);

    console.log('Transaction fee', fee);

    await resetSdkMock();
  });
});
