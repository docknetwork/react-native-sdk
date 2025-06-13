import {RpcService} from '../rpc-service-client';
import {serviceName, ExportDocuments, validation} from './configs';

export class WalletServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
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
