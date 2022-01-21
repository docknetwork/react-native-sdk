const SUBSCAN_URL = 'https://dock.api.subscan.io';

export function fetchTransactions({address, page = 0, row = 50}) {
  const url = `${SUBSCAN_URL}/api/scan/transfers`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      row,
      page,
      address: address,
    }),
  })
    .then(res => res.json())
    .then(res => {
      return {
        ...res.data,
        hasNextPage: (page + 1) * row < res.data.count,
      };
    });
}
