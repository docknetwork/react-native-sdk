import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import {
  serviceName,
  validation,
  KeypairToDIDKeyDocumentParams,
  GetDIDResolutionParams,
} from './config';
import {keyringService} from '../keyring/service';
import {utilCryptoService} from '../util-crypto/service';
import assert from 'assert';
import {createNewDockDID} from '@docknetwork/sdk/utils/did';
import {getDock} from '../dock/service';
import {PublicKeySr25519} from '@docknetwork/sdk';
import {DidKey, VerificationRelationship} from '@docknetwork/sdk/public-keys';
import {Logger} from '../../core/logger';
import {polkadotToKeydoc} from '../../core/polkadot-utils';

class DIDService {
  name: string;

  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    DIDService.prototype.keypairToDIDKeyDocument,
    DIDService.prototype.getDIDResolution,
    DIDService.prototype.generateKeyDoc,
    DIDService.prototype.registerDidDock,
    DIDService.prototype.getDidDockDocument,
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
    const {derivePath = '', type = 'ed25519', keyPairJSON} = params;
    let keyring;

    if (keyPairJSON) {
      keyring = keyringService.keyring.addFromJson(keyPairJSON);
      keyring.unlock('');
    } else {
      const mnemonic = await utilCryptoService.mnemonicGenerate(12);
      keyring = keyringService.getKeyringPair({
        mnemonic,
        derivePath,
        type,
      });
    }

    return polkadotToKeydoc(keyring, params.controller);
  }

  async getDidDockDocument(did) {
    assert(!!did, 'DID is required');
    const dock = getDock();
    const result = await dock.did.getDocument(did);
    return result;
  }

  async registerDidDock(keyPairJSON) {
    assert(!!keyPairJSON, 'keyPair is required');
    const dockDID = createNewDockDID();
    const dock = getDock();
    const keyPair = keyringService.keyring.addFromJson(keyPairJSON);

    keyPair.unlock('');

    dock.setAccount(keyPair);

    const publicKey = PublicKeySr25519.fromKeyringPair(keyPair);

    const didKey = new DidKey(publicKey, new VerificationRelationship());

    Logger.info(`Submitting new DID: ${dockDID}`);

    const result = await dock.did.new(dockDID, [didKey], [], false);

    Logger.info(`DID created with tx hash ${result.txHash.toString()}`);

    return {
      dockDID,
      keyPairWalletId: keyPairJSON.address,
    };
  }
}

export const didService = new DIDService();
