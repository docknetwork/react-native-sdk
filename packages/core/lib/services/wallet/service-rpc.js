import {RpcService} from '../rpc-service-client';
import {
  AddParams,
  CreateAccountDocumentsParams,
  ExportAccountParams,
  ImportWalletParams,
  QueryParams,
  serviceName,
  UpdateParams,
  validation,
} from './configs';

export class WalletServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }

  getDocumentById(id: string): Promise<any> {
    return this.call('getDocumentById', id);
  }

  create(params): Promise<any> {
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
    return this.call('add', params);
  }

  remove(id: string) {
    return this.call('remove', id);
  }

  update(params: UpdateParams) {
    return this.call('update', params);
  }

  query(params: QueryParams) {
    return this.call('query', params);
  }
  exportWallet(password: string) {
    return this.call('exportWallet', password);
  }
  importWallet(params: ImportWalletParams) {
    return this.call('importWallet', params);
  }
  exportAccount(params: ExportAccountParams) {
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
}
