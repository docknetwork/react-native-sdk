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
import {dockService, getDock} from '../dock/service';
import {PublicKeySr25519} from '@docknetwork/sdk';
import {DidKey, VerificationRelationship} from '@docknetwork/sdk/public-keys';
import {Logger} from '../../core/logger';
import {polkadotToKeydoc} from '../../core/polkadot-utils';
import base64url from 'base64url';
import { keyDocToKeypair } from '../credential/utils';
import Ed25519Signature2020 from '@docknetwork/sdk/utils/vc/crypto/Ed25519Signature2020';
import EcdsaSecp256k1Signature2019 from '@docknetwork/sdk/utils/vc/crypto/EcdsaSecp256k1Signature2019';

async function getSignerKeypair(privateKeyDoc) {
  const privateKey =
    privateKeyDoc.keypair || keyDocToKeypair(privateKeyDoc, dockService.dock);

  if (!privateKey.signer && privateKey.sign) {
    privateKey.signer = () => ({sign: ({data}) => privateKey.sign(data)});
  }

  // ed25519 should use latest
  if (privateKeyDoc.type.startsWith('Ed25519')) {
    return new Ed25519Signature2020({
      keypair: privateKey,
      ...privateKeyDoc,
    });
  }

  // HACK: for secp256k1 keyDocToKeypair returns an unusable class, wrap it in EcdsaSecp256k1Signature2019
  // TODO: refactor so that keyDocToKeypair returns EcdsaSecp256k1Signature2019
  if (privateKey.type === 'secp256k1') {
    return new EcdsaSecp256k1Signature2019({
      keypair: privateKey,
      ...privateKeyDoc,
    });
  }

  return privateKey;
}

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
    DIDService.prototype.createSignedJWT,

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

  async createSignedJWT({
    payload,
    privateKeyDoc,
    headerInput
  }) {
    const privateKey = await getSignerKeypair(privateKeyDoc);
    const {sign} =
      typeof privateKey.signer === 'function'
        ? privateKey.signer()
        : privateKey.signer;
    const header = {
      alg: privateKey.alg || 'EdDSA',
      kid: privateKeyDoc.id,
      ...headerInput,
    };
    const headerBase64URL = base64url(JSON.stringify(header));
    const payloadBase64URL = base64url(JSON.stringify(payload));
    const headerAndPayloadBase64URL = `${headerBase64URL}.${payloadBase64URL}`;
    const signPayload = Buffer.from(headerAndPayloadBase64URL);
  
    const signature = await sign({data: signPayload});
    return `${headerAndPayloadBase64URL}.${base64url.encode(signature)}`;
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
