import {
  WalletBackup,
  invalidFileMessage,
  noDocumentsFound,
  noAccountsFound,
} from './wallet-backup';
import {walletService} from '../services/wallet/service';
import {getPromiseError} from '../services/test-utils';
import emptyBackup from '../test/fixtures/backup-files/empty-json.json';
import emptyBackup2 from '../test/fixtures/backup-files/wallet-backup-1.json';
import backup11 from '../test/fixtures/backup-files/wallet-backup-11.json';

const password = '12345678Qw!';

describe('WalletBackup', () => {
  describe('validate', () => {
    beforeEach(async () => {
      await walletService.create({
        walletId: 'wallet',
        type: 'memory',
      });

      await walletService.removeAll();
    });

    // it('expect to handle empty file', async () => {
    //   const result = await getPromiseError(() =>
    //     WalletBackup.getInstance().validate(emptyBackup, password),
    //   );
    //   expect(result.message).toBe(invalidFileMessage);
    // });

    it('expect to handle empty file', async () => {
      const result = await getPromiseError(() =>
        WalletBackup.getInstance().validate(backup11, 'Mike1234!'),
      );

      console.log(result);
      expect(result.message).toBe(invalidFileMessage);
    });

    // it('expect to handle empty file', async () => {
    //   const result = await getPromiseError(() =>
    //     WalletBackup.getInstance().validate(emptyBackup2, password),
    //   );
    //   expect(result.message).toBe(noDocumentsFound);
    // });
  });
});
