import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';

let wallet: IWallet;

export async function getWallet(): Promise<IWallet> {
  if (!wallet) {
    wallet = await createWallet({
      databasePath: './wallet.db',
      dbType: 'sqlite',
      defaultNetwork: 'testnet',
    });
  }

  return wallet;
}
