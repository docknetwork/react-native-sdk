// @ts-nocheck
import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import {
  serviceName,
  validation,
  KeypairToDIDKeyDocumentParams,
  GetDIDResolutionParams,
} from './config';
import {utilCryptoService} from '../util-crypto/service';
import assert from 'assert';
import {blockchainService, getDock} from '../blockchain/service';

import {
  DidKey,
  DockDid,
  VerificationRelationship,
  DidMethodKey,
} from '@docknetwork/credential-sdk/types';
import {Ed25519Keypair} from '@docknetwork/credential-sdk/keypairs';

import {Logger} from '../../core/logger';
import base64url from 'base64url';
import {keyDocToKeypair} from '../credential/utils';
import {
  Ed25519Signature2020,
  EcdsaSecp256k1Signature2019,
} from '@docknetwork/credential-sdk/vc/crypto';
import { keypairToKeydoc } from './keypair-utils';

async function getSignerKeypair(privateKeyDoc) {
  const privateKey =
    privateKeyDoc.keypair || await keyDocToKeypair(privateKeyDoc);

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
    DIDService.prototype.deriveKeyDoc,
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
    const {derivePath = '', type = 'ed25519'} = params;
    const keyPair = Ed25519Keypair.random()
    return keypairToKeydoc(keyPair, params.controller);
  }

  async deriveKeyDoc(params) {
    validation.deriveKeyDoc(params);
    const { pair, type = 'ed25519' } = params;
    const keyPair = new Ed25519Keypair(pair.secretKey, 'private')
    return keypairToKeydoc(keyPair, params.controller);
  }

  async createSignedJWT({payload, privateKeyDoc, headerInput}) {
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
}

export const didService = new DIDService();
