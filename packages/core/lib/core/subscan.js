import axios from 'axios';

const SUBSCAN_URL = 'https://dock.api.subscan.io';

export function fetchTransactions({address, page = 0, itemsPerPage = 50}) {
  const url = `${SUBSCAN_URL}/api/scan/transfers`;

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
