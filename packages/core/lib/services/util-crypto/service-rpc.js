import {RpcService} from '../rpc-service-client';
import {validation} from './configs';

export class UtilCryptoServiceRpc extends RpcService {
  constructor() {
    super('utilCrypto');
  }

  mnemonicGenerate(numWords: number): Promise<any> {
    validation.mnemonicGenerate(numWords);

    return this.call('mnemonicGenerate', numWords);
  }

  mnemonicValidate(phrase: string): Promise<any> {
    validation.mnemonicValidate(phrase);

    return this.call('mnemonicValidate', phrase);
  }

  cryptoWaitReady(): Promise<any> {
    return this.call('cryptoWaitReady');
  }

  cryptoIsReady(): Promise<any> {
    return this.call('cryptoIsReady');
  }

  isAddressValid(address: string): Promise<any> {
    validation.deriveValidate(address);

    return this.call('isAddressValid', address);
  }

  deriveValidate(uri: strign): Promise<any> {
    validation.deriveValidate(uri);
    return this.call('deriveValidate', uri);
  }
}
