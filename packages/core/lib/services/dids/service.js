import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids';
import {
  serviceName,
  validation,
  KeypairToDidKeyDocumentParams,
  GetDidResolutionParams,
} from './config';
import {polkadotToKeydoc} from '@docknetwork/wallet/polkadot-utils';
import {keyringService} from '../keyring/service';
import {utilCryptoService} from '../util-crypto/service';

class DIDService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    DIDService.prototype.keypairToDidKeyDocument,
    DIDService.prototype.getDidResolution,
    DIDService.prototype.generateKeyDoc,
  ];
  keypairToDidKeyDocument(params: KeypairToDidKeyDocumentParams) {
    validation.keypairToDidKeyDocument(params);

    const {keypairDoc} = params;
    return DIDKeyManager.keypairToDidKeyDocument(keypairDoc);
  }
  getDidResolution(params: GetDidResolutionParams) {
    validation.getDidResolution(params);
    const {didDocument} = params;
    return DIDKeyManager.getDidResolution(didDocument);
  }
  async generateKeyDoc() {
    const mnemonic = await utilCryptoService.mnemonicGenerate(12);

    const keyring = keyringService.getKeyringPair({
      mnemonic,
      derivePath: '',
      type: 'ed25519',
    });

    return polkadotToKeydoc(keyring);
  }
}

export const didService = new DIDService();
