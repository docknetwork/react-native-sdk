import './setup-env';
import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {Accounts} from '@docknetwork/wallet-sdk-core/lib/modules/accounts';
import {UtilCryptoRpc} from '@docknetwork/wallet-sdk-core/lib/client/util-crypto-rpc';

async function main() {
  const wallet = Wallet.getInstance();

  await wallet.add({
    type: 'DID'
  });

  // Returns just addresses
  const searchResult = await wallet.query({
    type: 'Currency',
  });

  console.log(searchResult);

  const accounts = Accounts.getInstance();

  const mnemonic = await accounts.generateMnemonic();
  const myAccounts = await accounts.create({
    keyPairType: '',
    mnemonic
  });
  
  const allAccounts = accounts.getAccounts();
}

main();
