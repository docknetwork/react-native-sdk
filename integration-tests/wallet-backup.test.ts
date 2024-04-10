import {createNewWallet} from './helpers';
import {WalletBackupJSON, WalletBackupPasssword} from './data/wallet-backup';

describe('Wallet backups', () => {
  it('expect to import wallet from backup', async () => {
    const wallet = await createNewWallet();

    await wallet.importUniversalWalletJSON(
      WalletBackupJSON,
      WalletBackupPasssword,
    );

    const documents = await wallet.getAllDocuments();

    expect(documents.length).toBe(6);
  });

  it('expect to export wallet backup', async () => {
    const wallet = await createNewWallet();

    await wallet.importUniversalWalletJSON(
      WalletBackupJSON,
      WalletBackupPasssword,
    );

    const backup = await wallet.exportUniversalWalletJSON('test');

    expect(backup.credentialSubject).toBeDefined();
  });
});
