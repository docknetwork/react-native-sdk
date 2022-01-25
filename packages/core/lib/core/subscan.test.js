import {fetchTransactions} from './subscan';
import {mockSubscanParamsFailure, mockSubscanSuccess} from '../test/axiosMocks';

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
      await expect(() => {
        return fetchTransactions({})
      }).toThrowError('address must be a string');
    });
    
    it('validate page param', async () => {  
      await expect(() => {
        return fetchTransactions({address: '123', page: 'test'})
      }).toThrowError('page must be a number');
    });
    
    it('validate itemsPerPage param', async () => {  
      await expect(() => {
        return fetchTransactions({address: '123', itemsPerPage: 'test'})
      }).toThrowError('temsPerPage must be a number');
    });
  });
});
