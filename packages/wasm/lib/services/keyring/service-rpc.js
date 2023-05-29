import {RpcService} from '../rpc-service-client';
import {
  AddFromJsonParams,
  AddFromMnemonicParams,
  AddressFromUriParams,
  GetKeyringParams,
  serviceName,
  validation,
  SignDataParams,
} from './configs';

export class KeyringServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }

  initialize(params: InitializeParams) {
    validation.initialize(params);
    return this.call('initialize', params);
  }

  addFromMnemonic(params: AddFromMnemonicParams) {
    validation.addFromMnemonic(params);
    return this.call('addFromMnemonic', params);
  }

  addFromJson(params: AddFromJsonParams) {
    validation.addFromJson(params);
    return this.call('addFromJson', params);
  }

  decryptKeyPair(params: AddFromJsonParams) {
    validation.addFromJson(params);
    return this.call('decryptKeyPair', params);
  }

  getKeyringPair(params: GetKeyringParams) {
    validation.getKeyringPair(params);
    return this.call('getKeyringPair', params);
  }

  addressFromUri(params: AddressFromUriParams) {
    validation.addressFromUri(params);
    return this.call('addressFromUri', params);
  }

  signData(params: SignDataParams) {
    validation.signData(params);
    return this.call('signData', params);
  }
}
