import {rpcRequest} from '../rpc-client';

export class UtilCryptoRpc {
  static cryptoWaitReady() {
    return rpcRequest('utilCrypto.cryptoWaitReady');
  }
  
  static cryptoIsReady() {
    
    return rpcRequest('utilCrypto.cryptoIsReady');
  }
  
  static mnemonicGenerate() {
    return rpcRequest('utilCrypto.mnemonicGenerate');
  }
}
