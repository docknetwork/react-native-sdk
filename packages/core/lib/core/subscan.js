import axios from 'axios';
import assert from 'assert';

const SUBSCAN_URL = 'https://dock.api.subscan.io';

export function fetchTransactions({address, page = 0, itemsPerPage = 50}) {
  const url = `${SUBSCAN_URL}/api/scan/transfers`;

  assert(typeof address === 'string', 'address must be a string');
  assert(typeof page === 'number', 'page must be a number');
  assert(typeof itemsPerPage === 'number', 'itemsPerPage must be a number');

  return axios
    .post(url, {
      row: itemsPerPage,
      page,
      address: address,
    })
    .then(res => {
      const {data, message} = res.data;

      if (message === 'Success') {
        const {transfers, count} = data;
        return {
          items: transfers,
          count,
          page,
          hasNextPage: (page + 1) * itemsPerPage < count,
        };
      }

      throw new Error(message);
    });
}
