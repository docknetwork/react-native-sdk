import {Accounts} from '@docknetwork/wallet-sdk-wasm/src/modules/accounts';
import {
  Account2MnemonicDetails,
  AccountJSON,
  AccountJSONPassword,
} from '../data/accounts';
import {getWallet} from './wallet-helpers';
import {createAccountProvider} from '@docknetwork/wallet-sdk-core/lib/account-provider';

/**
 * Create new accounts
 */
export async function createAccounts() {
  const account = await getWallet().accounts.create({
    name: 'Account 1',
  } as any);

  await getWallet().accounts.create({
    name: 'Account 2',
  } as any);
}

/**
 * Import existing account from JSON
 */
export async function importAccountJSON() {
  return getWallet().accounts.create({
    name: 'Imported from JSON',
    json: AccountJSON,
    password: AccountJSONPassword,
  });
}

/**
 * Import existing account from mnemonic
 */
export async function importAccountFromMnemonic() {
  return getWallet().accounts.create({
    name: 'Account imported from mnemonic',
    mnemonic: Account2MnemonicDetails.mnemonic,
  } as any);
}

export async function getAccounts() {
  const accounts = createAccountProvider({
    wallet: getWallet(),
  });

  await accounts.load();

  return accounts.getAccounts();
}

export async function assertAccountIsValid(address) {
  const addressDocument = await getWallet().getDocumentById(address);
  const correlations = await getWallet().resolveCorrelations(address);

  expect(addressDocument).toBeDefined();

  const keyringPair = correlations.find(doc =>
    doc.type.includes('KeyringPair'),
  );
  expect(keyringPair).toBeDefined();

  const mnemonic = correlations.find(doc => doc.type.includes('Mnemonic'));
  expect(mnemonic).toBeDefined();
}
