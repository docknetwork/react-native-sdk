import {Wallet, WalletDocument} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {Accounts} from '@docknetwork/wallet-sdk-core/lib/modules/accounts';
import dock from '@docknetwork/sdk';
import { getKeyringPair } from '@docknetwork/wallet-sdk-core/lib/services/keyring';
import { ApiRpc } from '@docknetwork/wallet-sdk-core/lib/client/api-rpc';



const mockDocuments: WalletDocument[] = [];



describe('Wallet integration test', () => {
  let wallet = Wallet.getInstance();
  let accounts = Accounts.getInstance();

  beforeAll(async() => {
      await wallet.load();
      await Promise.all(mockDocuments.map(doc => wallet.add(doc)));
  });

  it('Import account + receive tokens + send tokens', async () => {
    // const documents = await wallet.query();
    const mnemonic = 'indicate mention thing discover clarify grief inherit vivid dish health market spoil';
    const account = await accounts.create({
      name: 'Test',
      mnemonic,
    });
    
    const keypair = await getKeyringPair({ mnemonic });

    expect(account.address).toBe('39SiPt8AHxtThrWZNcQadD1MA7WAcmcedC89hqcU22ZYrJn2');
    
    await accounts.fetchBalance(account.id);
    
    
    
    // dock.setAccount(keypair);
    // const extrinsic = dock.api.tx.balances.transfer(keypair.address, 1000);
    // const paymentInfo = await extrinsic.paymentInfo(keypair);
    // const info =  paymentInfo.partialFee.toString();
    // console.log(info);
    // dock.send()
  });
});
