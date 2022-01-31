import assert from 'assert';
import StorageWallet from '@docknetwork/wallet/storage-wallet';
import {v4 as uuid} from 'uuid';
import {KeypairTypes, WalletDocument} from '../types';
import MemoryWallet from '../wallet/memory-storage-wallet';
import RpcWallet from '../wallet/rpc-storage-wallet';
import {addFromJson, getKeyring, getKeyringPair} from './keyring';

let wallet: StorageWallet;

export const getWallet = (): StorageWallet => wallet;

async function getDocumentById(docId) {
  return (
    await wallet.query({
      equals: {
        'content.id': docId,
      },
    })
  )[0];
}

const exportAccount = async (accountId, password) => {
  const pair = await getAccountKeypair(accountId);

  return pair.toJson(password);
};

export const getAccountKeypair = async accountId => {
  const correlations = await resolveCorrelations(accountId);
  const keyPairDocument = correlations.find(doc => doc.type === 'KeyringPair');

  assert(!!keyPairDocument, `Keypair document not found for account: ${accountId}`)
  
  const pair = getKeyring().addFromJson(keyPairDocument.value);

  pair.unlock();

  return pair;
};


/**
 * TODO: Move this to the accounts module
 * 
 * Create all the documents required for an account
 *
 * The address, mnemonic, and keyringPair
 *
 * @param {*} param0
 * @returns documents
 */
const createAccountDocuments = async ({
  name,
  keyPairType = 'sr25519',
  derivePath,
  mnemonic,
  json,
  password,
}) => {
  assert(typeof name === 'string', `invalid account name: ${name}`);
  assert(
    !!KeypairTypes.find(t => t === keyPairType),
    `invalid keyPairType: ${keyPairType}`,
  );

  if (json) {
    assert(typeof password === 'string', `invalid password: ${password}`);
  } else {
    assert(typeof mnemonic === 'string', `invalid mnemonic: ${mnemonic}`);
  }

  const keyringPair = json
    ? addFromJson(json, password)
    : getKeyringPair({mnemonic, derivePath, keyPairType});
  const keyringJson = keyringPair.toJson();
  const correlationDocs: WalletDocument[] = [];

  correlationDocs.push({
    '@context': ['https://w3id.org/wallet/v1'],
    id: uuid(),
    type: 'KeyringPair',
    value: keyringJson,
  });

  correlationDocs.push({
    '@context': ['https://w3id.org/wallet/v1'],
    id: uuid(),
    type: 'Currency',
    value: 0,
    symbol: 'DOCK',
  });

  if (mnemonic) {
    correlationDocs.push({
      '@context': ['https://w3id.org/wallet/v1'],
      id: uuid(),
      type: 'Mnemonic',
      value: mnemonic,
    });
  }

  const addressDocument: WalletDocument = {
    '@context': ['https://w3id.org/wallet/v1'],
    id: keyringPair.address,
    type: 'Address',
    value: keyringPair.address,
    address: keyringPair.address,
    name,
    correlation: correlationDocs.map(doc => doc.id),
  };

  await wallet.add(addressDocument);
  await Promise.all(correlationDocs.map(doc => wallet.add(doc)));

  return [addressDocument, ...correlationDocs];
};

const resolveCorrelations = async documentId => {
  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  const correlation = await Promise.all(
    (document.correlation || []).map(docId => getDocumentById(docId)),
  );

  const result = [document, ...correlation];

  return result;
};

export default {
  name: 'wallet',
  routes: {
    async create(walletId, type) {
      if (type === 'memory') {
        wallet = new MemoryWallet(walletId);
      } else {
        wallet = new RpcWallet(walletId);
      }
      return walletId;
    },
    async load() {
      await wallet.load();
    },
    async sync() {
      await wallet.sync();
    },
    async lock(password) {
      await wallet.lock(password);
    },
    async unlock(password) {
      await wallet.unlock(password);
    },
    status() {
      return wallet.status;
    },
    toJSON() {
      return wallet.toJSON();
    },
    add(content) {
      return wallet.add(content);
    },
    remove(content) {
      return wallet.remove(content);
    },
    update(content) {
      return wallet.update(content);
    },
    query(search) {
      return wallet.query(search);
    },
    getStorageDocument({id}) {
      return wallet.getStorageDocument({id});
    },
    exportWallet(password) {
      return wallet.export(password);
    },
    importWallet: (data, password) => {
      return wallet.import(data, password);
    },
    exportAccount,
    createAccountDocuments,
    resolveCorrelations,
  },
};
