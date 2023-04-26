import axios from 'axios';
import axiosRetry from 'axios-retry';
import assert from 'assert';
import {Logger} from './logger';
import {TaskQueue} from 'cwait';

axiosRetry(axios, {
  retries: 4,
  retryDelay: retryCount => {
    return retryCount * 500;
  },
  retryCondition: error => {
    return error.response.status === 503 || error.response.status === 429;
  },
});

const SUBSCAN_URL = 'https://dock.api.subscan.io';

const queue = new TaskQueue(global.Promise, 1);

function doFetchTransactions({address, page = 0, itemsPerPage = 50}) {
  const url = `${SUBSCAN_URL}/api/scan/transfers`;

  assert(typeof address === 'string', 'address must be a string');
  assert(typeof page === 'number', 'page must be a number');
  assert(typeof itemsPerPage === 'number', 'itemsPerPage must be a number');

  const body = {
    row: itemsPerPage,
    page,
    address: address,
  };

  Logger.info(
    `Fetching transactions from subscan ${url} with body ${JSON.stringify(
      body,
    )}`,
  );

  return axios
    .post(url, body, {})
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
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
}

export const fetchTransactions = queue.wrap(doFetchTransactions);
