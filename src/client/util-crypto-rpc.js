import {rpcRequest} from '../rpc-client';

export class UtilCryptoRpc {
  static cryptoWaitReady() {
    return rpcRequest('utilCrypto.cryptoWaitReady');
  }
  
  static cryptoIsReady() {
    
    return rpcRequest('utilCrypto.cryptoIsReady');
  }
  
  static mnemonicGenerate(...params) {
    return rpcRequest('utilCrypto.mnemonicGenerate', ...params);
  }

  static isAddressValid(...params) {
    return rpcRequest('utilCrypto.isAddressValid', ...params);
  }
}
