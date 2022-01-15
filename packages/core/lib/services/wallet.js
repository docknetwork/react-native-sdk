import RpcWallet from '../wallet/rpc-storage-wallet';
import MemoryWallet from '../wallet/memory-storage-wallet';
import {LoggerRpc} from '../client/logger-rpc';
import {addressFromUri, getKeyring, getKeyringPair} from './keyring';
import StorageWallet from '@docknetwork/wallet/storage-wallet';
import {v4 as uuid } from 'uuid';
import {WalletDocument} from '../types';

let wallet: StorageWallet;

export const getWallet = (): StorageWallet  => wallet;

async function getDocumentById(docId) {
  return (await wallet.query({
    equals: {
      'content.id': docId,
    },
  }))[0];
}

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
    async exportAccount(accountId, password) {
      const account = await wallet.getStorageDocument({id: accountId});
      const mnemonicEntity = await wallet.getStorageDocument({
        id: account.content.correlation[0],
      });
      const mnemonic = mnemonicEntity.content.value;
      const accountMeta = account.meta || {};
      const derivePath = accountMeta.derivePath || '';
      const keyType = accountMeta.keyType || 'sr25519';
      const pair = getKeyring().createFromUri(
        `${mnemonic.trim()}${derivePath}`,
        {},
        keyType,
      );

      return pair.toJson(password);
    },

    /**
     * Create all the documents required for an account
     * 
     * The address, mnemonic, and keyringPair
     * 
     * @param {*} param0 
     * @returns 
     */
    createAccountDocuments: ({ name, keyPairType, derivePath, mnemonic }) => {
      const mnemonicId = uuid();
      const mnemonicDocument: WalletDocument = {
        '@context': ['https://w3id.org/wallet/v1'],
        id: uuid(),
        type: 'Mnemonic',
        value: mnemonic,
      }
      const keyringPair = getKeyringPair({ mnemonic, derivePath, keyPairType });
      const keyringJson = keyringPair.toJson();

      const keyringPairDocument: WalletDocument = {
        '@context': ['https://w3id.org/wallet/v1'],
        id: uuid(),
        type: 'KeyringPair',
        value: keyringJson
      };

      const currencyDocument: WalletDocument = {       
        '@context': ['https://w3id.org/wallet/v1'],
        id: uuid(),
        type: 'Currency',
        value: 0,
        symbol: 'DOCK',
      };

      const addressDocument: WalletDocument = {       
        '@context': ['https://w3id.org/wallet/v1'],
        id: keyringPair.address,
        type: 'Address',
        value: keyringPair.address,
        name,
        correlation: [mnemonicDocument.id, keyringPairDocument.id, currencyDocument.id],
      };

      wallet.add(addressDocument);
      wallet.add(keyringPairDocument);
      wallet.add(mnemonicDocument);
      wallet.add(currencyDocument);

      return [
        addressDocument,
        keyringPairDocument,
        mnemonicDocument,
        currencyDocument,
      ];
    },
    resolveCorrelations: async (documentId) => {
      const document = await getDocumentById(documentId);
      const correlation = await Promise.all((document.correlation || []).map(docId => getDocumentById(docId)));

      const result = [
        document,
        ...correlation,
      ];

      return result;
    },
    getKeyringForAddress: (addressId) => {
      // const accountDetails = (
      //   await getWallet().query({
      //     equals: {
      //       'content.id': addressId,
      //     },
      //   })
      // )[0];
      // const mnemonic = (
      //   await getWallet().query({
      //     equals: {
      //       'content.id': accountDetails.correlation[0],
      //     },
      //   })
      // )[0];

      // // if document id
      // wallet.query({

      // })
    }
  },
};
