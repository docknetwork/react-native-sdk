import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import {
  serviceName,
  validation,
  KeypairToDIDKeyDocumentParams,
  GetDIDResolutionParams,
} from './config';
import {keyringService} from '../keyring/service';
import {utilCryptoService} from '../util-crypto/service';
import {walletService} from '../wallet/service';
import assert from 'assert';
import {createNewDockDID} from '@docknetwork/sdk/utils/did';
import {getDock} from '../dock/service';
import {PublicKeySr25519} from '@docknetwork/sdk';
import {DidKey, VerificationRelationship} from '@docknetwork/sdk/public-keys';
import {Logger} from '../../core/logger';
import {getKeydocFromPair} from '@docknetwork/universal-wallet/methods/keypairs';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import {polkadotToKeydoc} from './polkadot-utils';

class DIDService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    DIDService.prototype.keypairToDIDKeyDocument,
    DIDService.prototype.getDIDResolution,
    DIDService.prototype.generateKeyDoc,
    DIDService.prototype.registerDidDock,
    DIDService.prototype.getDidDockDocument,
    DIDService.prototype.generateDIDDockKeyDoc,
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

    return polkadotToKeydoc(keyring, params.controller);
  }

  async getDidDockDocument(did) {
    assert(!!did, 'DID is required');
    const dock = getDock();
    const result = await dock.did.getDocument(did);
    return result;
  }
  async generateDIDDockKeyDoc(params) {
    validation.generateDIDDockKeyDoc(params);
    const {keypairId, controller} = params;
    const keyPairJSON = await walletService.getDocumentById(keypairId);
    assert(!!keyPairJSON, 'KeyringPair not found');
    const keyPair = keyringService.keyring.addFromJson(keyPairJSON.value);
    keyPair.unlock('');
    return polkadotToKeydoc(keyPair, controller);
  }

  async registerDidDock(address) {
    assert(!!address, 'address is required');
    const dockDID = createNewDockDID();
    const dock = getDock();
    const correlations = await walletService.resolveCorrelations(address);
    const keyPairJSON = correlations.find(item => item.type === 'KeyringPair');
    assert(!!keyPairJSON, `KeyringPair not found for address ${address}`);

    const keyPair = keyringService.keyring.addFromJson(keyPairJSON.value);
    keyPair.unlock('');

    dock.setAccount(keyPair);

    const publicKey = PublicKeySr25519.fromKeyringPair(keyPair);

    const didKey = new DidKey(publicKey, new VerificationRelationship());

    Logger.info(`Submitting new DID: ${dockDID}`);

    const result = await dock.did.new(dockDID, [didKey], [], false);

    Logger.info(`DID created with tx hash ${result.txHash.toString()}`);

    return {
      dockDID,
      keyPairWalletId: keyPairJSON.id,
    };
  }
}

export const didService = new DIDService();
