import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids';
import {
  serviceName,
  validation,
  KeypairToDIDKeyDocumentParams,
  GetDIDResolutionParams,
} from './config';
import {polkadotToKeydoc} from '@docknetwork/wallet/polkadot-utils';
import {keyringService} from '../keyring/service';
import {utilCryptoService} from '../util-crypto/service';

class DIDService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    DIDService.prototype.keypairToDIDKeyDocument,
    DIDService.prototype.getDIDResolution,
    DIDService.prototype.generateKeyDoc,
  ];
  keypairToDIDKeyDocument(params: KeypairToDIDKeyDocumentParams) {
    validation.keypairToDIDKeyDocument(params);

    const {keypairDoc} = params;
    return DIDKeyManager.keypairToDIDKeyDocument(keypairDoc);
  }
  getDIDResolution(params: GetDIDResolutionParams) {
    validation.getDIDResolution(params);
    const {didDocument} = params;
    return DIDKeyManager.getDIDResolution(didDocument);
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
