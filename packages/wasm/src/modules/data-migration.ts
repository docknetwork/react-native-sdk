// @ts-nocheck
import {Logger} from '../core/logger';
import {getStorage} from '../core/storage';
import {Wallet} from './wallet';

type MigrateParams = {
  wallet: Wallet,
};

const currentWalletVersion = '0.2';

export async function migrate({wallet}: MigrateParams) {
  Logger.debug('Starting wallet migration');

  const docs = await wallet.query({});

  if (!docs.length) {
    Logger.debug(
      `Empty wallet, adding version ${currentWalletVersion} document`,
    );
    await wallet.add({
      type: 'Metadata',
      walletVersion: currentWalletVersion,
    });
  }

  const version = await wallet.getVersion();
  let migrated = false;

  Logger.debug(`Wallet version ${version}`);

  if (version !== currentWalletVersion) {
    const snapshot = await getStorage().getItem(wallet.walletId);
    await getStorage().setItem(`${wallet.walletId}-snapshot`, snapshot);
  }

  if (version === '0.1') {
    const targetVersion = '0.2';
    Logger.debug(`Migrating wallet ${version} to ${targetVersion}`);
    const legacyAccounts = docs.filter((doc: any) => doc.type === 'Account');
    await Promise.all(
      legacyAccounts.map(async (account: any) => {
        const relatedDocs = docs.filter(doc =>
          account.correlation.find(id => id === doc.id),
        );
        const mnemonicDoc = relatedDocs.find(doc => doc.type === 'Mnemonic');
        const keyPairDoc = relatedDocs.find(doc => doc.type === 'KeyPair');

        try {
          if (mnemonicDoc) {
            await wallet.remove(mnemonicDoc.id);
            await wallet.remove(account.id);
            await wallet.accounts.create({
              mnemonic: mnemonicDoc.value,
              name: account.meta.name,
              type: account.meta.keypairType,
              derivationPath: account.meta.derivationPath,
            });
          } else if (keyPairDoc) {
            console.log(keyPairDoc);
            await wallet.remove(keyPairDoc.id);
            await wallet.remove(account.id);
            await wallet.accounts.create({
              name: account.meta.name,
              json: keyPairDoc.value,
              password: '',
            });
          }
        } catch (err) {
          Logger.error(`failed to migrate account ${account.id}`);
          Logger.error(err);
          throw err;
        }
      }),
    );

    await wallet.add({
      type: 'Metadata',
      walletVersion: `${targetVersion}`,
    });

    migrated = true;
  }

  return migrated;
}
