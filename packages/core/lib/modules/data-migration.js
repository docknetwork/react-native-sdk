import {WalletDocument} from '../types';
import {Logger} from '../core/logger';
import {Wallet} from './wallet';

export const getWalletVersion = (docs: WalletDocument): String => {
  const doc = docs.find((item: WalletDocument) => item.type === 'Metadata');
  return (doc && doc.walletVersion) || '0.1';
};

type MigrateParams = {
  wallet: Wallet,
};

export async function migrate({wallet}: MigrateParams) {
  Logger.debug('Stating wallet migration');

  const docs = await wallet.query({});
  // detect wallet version
  const version = getWalletVersion(docs);

  if (version === '0.1') {
    Logger.debug(`Migrating wallet ${version} to 0.2`);
    const lagacyAccounts = docs.filter((doc: any) => doc.type === 'Account');
    await Promise.all(
      lagacyAccounts.map(async (account: any) => {
        const relatedDocs = docs.filter(doc =>
          account.correlation.find(id => id === doc.id),
        );
        const mnemonicDoc = relatedDocs.find(doc => doc.type === 'Mnemonic');

        if (!mnemonicDoc) {
          return;
        }

        await wallet.remove(mnemonicDoc.id);
        await wallet.remove(account.id);

        await wallet.accounts.create({
          mnemonic: mnemonicDoc.value,
          name: account.meta.name,
          type: account.meta.keypairType,
          derivationPath: account.meta.derivationPath,
        });
      }),
    );
  }
}
