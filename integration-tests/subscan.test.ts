import {fetchTransactions} from '@docknetwork/wallet-sdk-wasm/src/core/subscan';

const accountAddress = '3HM9DYxHe5tAwh2cuErNHiLxSMDJhetxaVGCDTYXiwyuuHN6';

function validateSchema(item) {
  expect(item.from).toBeDefined();
  expect(item.to).toBeDefined();
  expect(item.hash).toBeDefined();
  expect(item.amount).toBeDefined();
  expect(item.fee).toBeDefined();
}

describe('subscan integration', () => {
  it('should fetch transactions using subscan APIs', async () => {
    const {items} = await fetchTransactions({
      address: accountAddress,
    });

    expect(items.length > 0).toBe(true);

    items.forEach(validateSchema);
  });
});
