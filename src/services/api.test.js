import Keyring, { KeyringPair } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import dock from "@docknetwork/sdk";
import ApiService from './api';
import DockService from './dock';

const phrase =
  "hole dog cross program hungry blue burst raccoon differ rookie pipe auction";

describe("ApiService", () => {
  let keyring: Keyring;
  // let faucetAccount;
  let testAccount;

  beforeAll(async () => {
    await cryptoWaitReady();
    keyring = new Keyring();
  
    await DockService.routes.init({
      address: 'wss://knox-1.dock.io',
    });
    
    // faucetAccount = keyring.addFromUri('//Bob');
    testAccount = keyring.addFromUri(`${phrase}`);
  });

  it("Get account address", async () => {
    console.log(testAccount);
    expect(testAccount.address).toBe('3AqFkPbKcrzUmGVBztLfEXHcZJVUJ9tpF8civn6KruuATjZq');
  });
  
  // it("Get account balance", async () => {
  //   const balance = await ApiService.routes.getAccountBalance(testAccount.address);
  //   console.log(balance);
  //   expect(balance).toBe(1000000000);
  // });

  // it("Send tokens", async () => {
  //   const dripAmount = 1000;
  //   const dripBalance = dock.api.createType('Balance', dripAmount);
  //   const accountData = await dock.api.query.system.account(testAccount.address);
  //   // console.log(accountData);
  // });
});
