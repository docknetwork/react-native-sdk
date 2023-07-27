import {fetchTransactions} from './subscan';
import {mockSubscanParamsFailure, mockSubscanSuccess} from '../test/axiosMocks';
import {getPromiseError} from '../services/test-utils';

describe('Subscan integration', () => {
  describe('fetchTransactions', () => {
    it('expect to return transactions', async () => {
      mockSubscanSuccess();

      const transactions = await fetchTransactions({address: '123'});

      expect(transactions.items.length).toBe(12);
      expect(transactions.hasNextPage).toBe(true);
    });

    it('expect to return transactions (last page)', async () => {
      mockSubscanSuccess();

      const transactions = await fetchTransactions({address: '123', page: 2});

      expect(transactions.hasNextPage).toBe(false);
    });

    it('expect to handle api error', async () => {
      let error;
      mockSubscanParamsFailure();

      try {
        await fetchTransactions({address: '123', page: 2});
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('Params Error');
    });

    it('validate adddress param', async () => {
      const error = await getPromiseError(() => fetchTransactions({}));
      expect(error.message).toBe('address must be a string');
    });

    it('validate page param', async () => {
      const error = await getPromiseError(() =>
        fetchTransactions({address: '123', page: 'test'}),
      );
      await expect(error.message).toBe('page must be a number');
    });

    it('validate itemsPerPage param', async () => {
      const error = await getPromiseError(() =>
        fetchTransactions({address: '123', itemsPerPage: 'test'}),
      );
      await expect(error.message).toBe('itemsPerPage must be a number');
    });
  });
});
