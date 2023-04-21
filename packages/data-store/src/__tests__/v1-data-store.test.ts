import {setupV1MockDataStore} from '../../test/test-utils';
import {
  getV1LocalStorage,
  getWalletDocument,
} from '../migration/v2/v1-data-store';
import _walletJSON from '../../test/wallet.json';

describe('v2-data-store', () => {
  beforeAll(async () => {
    await setupV1MockDataStore();
  });

  it('should have access to v2 localStorage', async () => {
    const jsonData = await getV1LocalStorage().getItem('wallet');
    expect(jsonData).toBeDefined();
    const wallet = JSON.parse(jsonData as string);
    expect(wallet).toStrictEqual(_walletJSON);
  });

  it('should be able to fetch v2 documents', async () => {
    const documents = await getWalletDocument();
    expect(documents.length).toBeGreaterThan(1);
  });
});
