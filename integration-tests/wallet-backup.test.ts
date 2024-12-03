import {closeWallet, createNewWallet} from './helpers';
import {WalletBackupJSON, WalletBackupPasssword} from './data/wallet-backup';
import { dockService } from '@docknetwork/wallet-sdk-wasm/lib/services/dock';

describe('Wallet backups', () => {
  it('expect to import wallet from backup', async () => {
    const wallet = await createNewWallet({
      dontWaitForNetwork: true,
    });

    await wallet.importUniversalWalletJSON(
      WalletBackupJSON,
      WalletBackupPasssword,
    );

    const documents = await wallet.getAllDocuments();

    expect(documents.length).toBe(6);
  });

  it('expect to export wallet backup', async () => {
    const wallet = await createNewWallet({
      dontWaitForNetwork: true,
    });

    await wallet.importUniversalWalletJSON(
      WalletBackupJSON,
      WalletBackupPasssword,
    );

    const backup = await wallet.exportUniversalWalletJSON('test');

    expect(backup.credentialSubject).toBeDefined();
  });

  afterEach(async () => {
    await dockService.disconnect();
  })

  afterAll(() => closeWallet());
});
