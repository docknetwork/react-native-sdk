import {getPromiseError} from '../services/test-utils';
import {walletService} from '../services/wallet/service';
import backup11 from '../test/fixtures/backup-files/wallet-backup-11.json';
import {invalidFileMessage, WalletBackup} from './wallet-backup';

describe('WalletBackup', () => {
  describe('validate', () => {
    beforeEach(async () => {
      await walletService.create({
        walletId: 'wallet',
        type: 'memory',
      });

      await walletService.removeAll();
    });

    it('expect to handle empty file', async () => {
      const result = await getPromiseError(() =>
        WalletBackup.getInstance().validate(backup11, 'Mike1234!'),
      );

      console.log(result);
      expect(result.message).toBe(invalidFileMessage);
    });
  });
});
