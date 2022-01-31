import {
  mockTransaction,
  resetMockTransaction,
  waitFor,
} from '@docknetwork/wallet-sdk-core/lib/test-utils';
import {ApiRpc} from './client/api-rpc';
import {getRpcEventEmitter} from './events';

const emitter = getRpcEventEmitter();

describe('Test utils', () => {
  describe('mock transaction', () => {
    const hash = '0x1234';
    const fee = 2;
    const delay = 100;
    const txInput = {
      toAddress: 'to-addres',
      fromAddress: 'from-address',
      amount: 1,
    };

    beforeEach(async () => {
      resetMockTransaction();
      jest.spyOn(emitter, 'emit');
    });

    it('transaction complete', async () => {
      mockTransaction({
        hash,
        fee,
        delay,
      });

      let result = await ApiRpc.getFeeAmount(txInput);

      expect(result).toBe(fee);

      result = await ApiRpc.sendTokens(txInput);

      expect(result).toBe(hash);

      await waitFor(delay * 2);

      expect(emitter.emit).toBeCalledWith(`${hash}-complete`);
    });

    it('transaction error', async () => {
      const error = 'error';

      mockTransaction({
        hash,
        fee,
        delay,
        error,
      });

      const result = await ApiRpc.sendTokens(txInput);

      expect(result).toBe(hash);

      await waitFor(delay * 2);

      expect(emitter.emit).toBeCalledWith(`${hash}-failed`, error);
    });
  });
});
