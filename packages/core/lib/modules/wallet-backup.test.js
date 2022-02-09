import {getPromiseError} from '../services/test-utils';
import {walletService} from '../services/wallet/service';
import emptyBackup from '../test/fixtures/backup-files/empty-wallet-backup.json';
import {WalletBackup} from './wallet-backup';

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
        WalletBackup.getInstance().validate(emptyBackup, 'test'),
      );
      expect(result.message).toBeDefined();
    });
  });
});
