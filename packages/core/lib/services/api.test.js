import Keyring from '@polkadot/keyring';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import ApiService from './api';
import DockService from './dock';
import WalletService, {getWallet} from './wallet';

const phrase =
  'hole dog cross program hungry blue burst raccoon differ rookie pipe auction';

describe('ApiService', () => {
  let keyring: Keyring;
  let testAccount;

  beforeAll(async () => {
    await cryptoWaitReady();
    keyring = new Keyring({
      ss58Format: 21,
    });

    await DockService.routes.init({
      address: 'wss://knox-1.dock.io',
    });

    await WalletService.routes.create('test-wallet', 'memory');
    const mnemonicId = `${Date.now()}`;
    const accountName = 'Test Account';

    testAccount = keyring.addFromMnemonic(phrase, null, 'sr25519');

    await getWallet().add({
      '@context': ['https://w3id.org/wallet/v1'],
      id: testAccount.address,
      type: 'Account',
      correlation: [mnemonicId],
      meta: {
        name: accountName,
      },
    });

    await getWallet().add({
      '@context': ['https://w3id.org/wallet/v1'],
      id: mnemonicId,
      name: accountName,
      type: 'Mnemonic',
      value: phrase,
    });
  });

  it('Get account address', async () => {
    expect(testAccount.address).toBe(
      '3AqFkPbKcrzUmGVBztLfEXHcZJVUJ9tpF8civn6KruuATjZq',
    );
  });

  it('Get account balance', async () => {
    const balance = await ApiService.routes.getAccountBalance(
      testAccount.address,
    );

    expect(parseInt(balance, 10)).toBeGreaterThanOrEqual(50);
  });

  it('Get transaction fee amount', async () => {
    const fee = await ApiService.routes.getFeeAmount({
      accountAddress: '5CGbZiZCVh5mshErU8pT4c2PnYjDbhaxeFtJG5prZUge3i7e',
      amount: '1000',
      recipientAddress: '37GfhtNUJk1aJhXuGxNJsAGenteDBX3DTVAvuBZm49Kqc9wA',
    });

    expect(parseInt(fee, 10)).toBeGreaterThanOrEqual(1000);
  });
});
