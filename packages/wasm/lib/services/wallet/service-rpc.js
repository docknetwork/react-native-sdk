import {RpcService} from '../rpc-service-client';
import {
  AddParams,
  CreateAccountDocumentsParams,
  ExportAccountParams,
  ImportWalletParams,
  QueryParams,
  serviceName,
  UpdateParams,
  GetDocumentsFromEncryptedWallet,
  ExportDocuments,
  validation,
} from './configs';

export class WalletServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }

  getDocumentById(id: string): Promise<any> {
    validation.getDocumentById(id);
    return this.call('getDocumentById', id);
  }

  create(params: CreateParams): Promise<any> {
    validation.create(params);
    return this.call('create', params);
  }
  load() {
    return this.call('load');
  }
  sync() {
    return this.call('sync');
  }
  lock(password) {
    return this.call('lock');
  }
  healthCheck(timestamp) {
    return this.call('healthCheck', timestamp);
  }
  unlock(password) {
    return this.call('unlock');
  }
  status() {
    return this.call('status');
  }
  toJSON() {
    return this.call('toJSON');
  }

  add(params: AddParams) {
    validation.add(params);
    return this.call('add', params);
  }

  remove(id: string) {
    validation.remove(id);
    return this.call('remove', id);
  }

  update(params: UpdateParams) {
    validation.update(params);
    return this.call('update', params);
  }

  query(params: QueryParams) {
    validation.query(params);
    return this.call('query', params);
  }

  exportWallet(password: string) {
    validation.exportWallet(password);
    return this.call('exportWallet', password);
  }

  importWallet(params: ImportWalletParams) {
    validation.importWallet(params);
    return this.call('importWallet', params);
  }

  exportAccount(params: ExportAccountParams) {
    validation.exportAccount(params);
    return this.call('exportAccount', params);
  }

  createAccountDocuments(params: CreateAccountDocumentsParams) {
    validation.createAccountDocuments(params);
    return this.call('createAccountDocuments', params);
  }

  resolveCorrelations(address: string) {
    validation.resolveCorrelations(address);
    return this.call('resolveCorrelations', address);
  }

  getDocumentsFromEncryptedWallet(params: GetDocumentsFromEncryptedWallet) {
    validation.getDocumentsFromEncryptedWallet(params);
    return this.call('getDocumentsFromEncryptedWallet', params);
  }
  exportDocuments(params: ExportDocuments) {
    validation.exportDocuments(params);
    return this.call('exportDocuments', params);
  }
}
