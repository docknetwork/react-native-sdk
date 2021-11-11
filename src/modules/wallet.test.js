import { Wallet } from "./wallet";

describe('ApiRpc', () => {
  let wallet = Wallet.getInstance();

  beforeAll(() => {
    wallet.load();
  });

  it('getAccountBalance', async () => {
    wallet.getKey();
  });
});
