import Keyring, { KeyringPair } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import dock from "@docknetwork/sdk";
import ApiService from './api';
import DockService from './dock';
import WalletService, { getWallet } from './wallet';

const phrase =
  "hole dog cross program hungry blue burst raccoon differ rookie pipe auction";

describe("ApiService", () => {
  let keyring: Keyring;
  let testAccount;

  beforeAll(async () => {
    await cryptoWaitReady();
    keyring = new Keyring();

    await DockService.routes.init({
      address: 'wss://knox-1.dock.io',
    });

    await WalletService.routes.create('test-wallet', 'memory');
    const mnemonicId = `${Date.now()}`;
    const accountName = 'Test Account';

    testAccount = keyring.addFromUri(`${phrase}`);

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

  it("Get account address", async () => {
    console.log(testAccount);
    expect(testAccount.address).toBe('5CGbZiZCVh5mshErU8pT4c2PnYjDbhaxeFtJG5prZUge3i7e');
  });

  it("Get account balance", async () => {
    const balance = await ApiService.routes.getAccountBalance(testAccount.address);
    console.log(balance);
    expect(parseInt(balance)).toBeGreaterThanOrEqual(50);
  });

  it("Get transaction fee amount", async () => {
    const fee = await ApiService.routes.getFeeAmount({
      accountAddress: '5CGbZiZCVh5mshErU8pT4c2PnYjDbhaxeFtJG5prZUge3i7e',
      amount: '1000',
      recipientAddress: '37GfhtNUJk1aJhXuGxNJsAGenteDBX3DTVAvuBZm49Kqc9wA'
    });

    expect(parseInt(fee)).toBeGreaterThanOrEqual(1000);
  });
});
