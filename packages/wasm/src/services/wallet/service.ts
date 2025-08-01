// @ts-nocheck
import StorageWallet from '@docknetwork/universal-wallet/storage-wallet';
import assert from 'assert';
import {v4 as uuid} from 'uuid';
import {WalletDocument} from '../../types';
import MemoryWallet from '../../wallet/memory-storage-wallet';
import RpcWallet from '../../wallet/rpc-storage-wallet';
import {
  CreateAccountDocumentsParams,
  CreateParams,
  ExportAccountParams,
  ImportWalletParams,
  serviceName,
  validation,
} from './configs';
import {Logger} from '../../core/logger';

/**
 * WalletService
 */
export class WalletService {
  wallet: StorageWallet;

  rpcMethods = [
    WalletService.prototype.getDocumentsFromEncryptedWallet,
    WalletService.prototype.exportDocuments,
  ];

  constructor() {
    this.name = serviceName;
  }

  async getDocumentsFromEncryptedWallet(params) {
    validation.getDocumentsFromEncryptedWallet(params);
    const {encryptedJSONWallet, password} = params;
    const tempMemoryWallet = new MemoryWallet('tempWallet');
    await tempMemoryWallet.import(
      typeof encryptedJSONWallet === 'object'
        ? encryptedJSONWallet
        : JSON.parse(encryptedJSONWallet),
      password,
    );
    await tempMemoryWallet.sync();
    const docs = tempMemoryWallet.contents.map(doc => {
      return doc;
    });
    for (const doc of docs) {
      await tempMemoryWallet.remove(doc.id);
    }
    await tempMemoryWallet.sync();
    return docs;
  }
  async exportDocuments(params) {
    validation.exportDocuments(params);
    const {documents, password} = params;
    const tempMemoryWallet = new MemoryWallet('tempWallet');
    for (const doc of documents) {
      await tempMemoryWallet.add(doc);
    }
    await tempMemoryWallet.sync();
    const encryptedWallet = await tempMemoryWallet.export(password);

    for (const doc of documents) {
      await tempMemoryWallet.remove(doc.id);
    }
    await tempMemoryWallet.sync();
    return encryptedWallet;
  }
}

export const walletService: WalletService = new WalletService();
