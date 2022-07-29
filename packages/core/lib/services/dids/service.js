import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import {
  serviceName,
  validation,
  KeypairToDIDKeyDocumentParams,
  GetDIDResolutionParams,
} from './config';
import {polkadotToKeydoc} from '@docknetwork/wallet/polkadot-utils';
import {keyringService} from '../keyring/service';
import {utilCryptoService} from '../util-crypto/service';
import {walletService} from '../wallet/service';
import assert from 'assert';
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
    const {didDocument, didDocumentCustomProp = {}} = params;
    return DIDKeyManager.getDIDResolution(didDocument, didDocumentCustomProp);
  }
  async generateKeyDoc(params) {
    validation.generateKeyDoc(params);
    const {derivePath = '', type = 'ed25519'} = params;
    const mnemonic = await utilCryptoService.mnemonicGenerate(12);

    const keyring = keyringService.getKeyringPair({
      mnemonic,
      derivePath,
      type,
    });

    return polkadotToKeydoc(keyring);
  }

  async registerDidDock(address) {
    assert(!!address, 'address is required');
    const correlations = await walletService.resolveCorrelations(address);
    debugger;
    return 'ok';
  }
}

export const didService = new DIDService();
