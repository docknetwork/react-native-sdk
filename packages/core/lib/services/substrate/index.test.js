import {TestFixtures} from '../../fixtures';
import {
  assertRpcService,
  getPromiseError,
  mockDockService,
  setMockTransactionError,
  setupTestWallet,
} from '../test-utils';
import {validation} from './configs';
import {substrateService as service} from './service';
import {SubstrateServiceRpc} from './service-rpc';

describe('ExampleService', () => {
  it('ServiceRpc', () => {
    assertRpcService(SubstrateServiceRpc, service, validation);
  });

  describe('service', () => {
    let unmockDockService;

    beforeAll(async () => {
      unmockDockService = await mockDockService();
      await setupTestWallet();
    });

    describe('getAccountBalance', () => {
      it('expect to get account balance', async () => {
        const balance = await service.getAccountBalance({
          address: TestFixtures.account1.address,
        });
        expect(typeof balance).toBe('number');
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.getAccountBalance({address: null}),
        );
        expect(error.message).toBe('invalid address null');
      });
    });

    describe('getFeeAmount', () => {
      it('expect to get fee amount', async () => {
        const fee = await service.getFeeAmount({
          toAddress: TestFixtures.account2.address,
          fromAddress: TestFixtures.account1.address,
          amount: 0,
        });
        expect(fee).toBeGreaterThan(0);
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.getFeeAmount({
            amount: null,
            fromAddress: 'address',
            toAddress: 'adress',
          }),
        );
        expect(error.message).toBe('invalid amount');
      });
    });

    describe('sendTokens', () => {
      it('expect to send tokens', async () => {
        setMockTransactionError(null);
        const hash = await service.sendTokens({
          amount: 1,
          fromAddress: TestFixtures.account1.address,
          toAddress: TestFixtures.account2.address,
        });


        expect(typeof hash).toBe('string');
      });

      it('expect to handle transaction error', async () => {
        const errorMessage = 'some error from substrate';

        setMockTransactionError(errorMessage);

        const error = await getPromiseError(() =>
          service.sendTokens({
            amount: 1,
            fromAddress: TestFixtures.account1.address,
            toAddress: TestFixtures.account2.address,
          }),
        );

        expect(error.message).toBe(errorMessage);
      });
    });

    afterAll(async () => {
      await unmockDockService();
    });
  });
});
