import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';
import {
  createDIDProvider,
  IDIDProvider,
} from '@docknetwork/wallet-sdk-core/src/did-provider';

let wallet: IWallet;
let didProvider: IDIDProvider;

export async function getWallet(): Promise<IWallet> {
  if (!wallet) {
    wallet = await createWallet({
      databasePath: './wallet.db',
      dbType: 'sqlite',
      defaultNetwork: 'testnet',
    });

    didProvider = createDIDProvider({wallet});
    await didProvider.ensureDID();
  }

  return wallet;
}

export function getDIDProvider(): IDIDProvider {
  return didProvider;
}
