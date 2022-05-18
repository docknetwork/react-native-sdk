import {DOCK_TOKEN_UNIT} from '../../core/format-utils';
import {TestFixtures} from '../../fixtures';
import {once} from '../../modules/event-manager';
import {dockService} from '../dock/service';
import {mockDockService, setMockTransactionError} from '../test-utils';
import {signAndSend} from './api-utils';
import {substrateService} from './service';

describe('ApiUtils', () => {
  let unmockDockService;

  beforeAll(async () => {
    unmockDockService = await mockDockService();
  });

  describe('signAndSend', () => {
    it('expect to send tokens', async () => {
      const account = TestFixtures.account1.getKeyring();
      dockService.dock.setAccount(account);
      const extrinsic = dockService.dock.api.tx.balances.transfer(
        TestFixtures.account2.address,
        1,
      );
      setMockTransactionError(null);
      const emitter = signAndSend(account, extrinsic);
      const [result] = await once(emitter, 'done');


      expect(typeof result).toBe('string');
    });

    it('expect to get error: Inability to pay fees', async () => {
      const account = TestFixtures.noBalanceAccount.getKeyring();
      dockService.dock.setAccount(account);
      const extrinsic = dockService.dock.api.tx.balances.transfer(
        TestFixtures.account2.address,
        1,
      );
      const errorMessage =
        '1010: Invalid Transaction: Inability to pay some fees , e.g. account balance too low';

      setMockTransactionError(errorMessage);
      const emitter = signAndSend(account, extrinsic);
      const error = await once(emitter, 'error');

      expect(error.message).toBe(errorMessage);
    });

    it('expect to get error: Not enough balance', async () => {
      const account = TestFixtures.account1.getKeyring();
      dockService.dock.setAccount(account);
      const balance = await substrateService.getAccountBalance({
        address: TestFixtures.account1.address,
      });
      const extrinsic = dockService.dock.api.tx.balances.transfer(
        TestFixtures.account2.address,
        balance * 2 * DOCK_TOKEN_UNIT,
      );

      const errorMessage =
        'balances.InsufficientBalance:  Balance too low to send value';

      setMockTransactionError(errorMessage);
      const emitter = signAndSend(account, extrinsic);
      const error = await once(emitter, 'error');

      expect(error.message).toBe(errorMessage);
    });
  });

  afterAll(() => unmockDockService);
});
