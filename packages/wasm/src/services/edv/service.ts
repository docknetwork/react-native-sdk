// @ts-nocheck
import {InitializeEDVParams, serviceName} from './configs';
import EDVHTTPStorageInterface from '@docknetwork/universal-wallet/storage/edv-http-storage';
import HMAC from './hmac';
import {Ed25519VerificationKey2018} from '@digitalbazaar/ed25519-verification-key-2018';
import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
import {X25519KeyAgreementKey2020} from '@digitalbazaar/x25519-key-agreement-key-2020';
import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import {didService} from '@docknetwork/wallet-sdk-wasm/src/services/dids/service';
import {Ed25519Keypair} from '@docknetwork/credential-sdk/keypairs';

/**
 * EDVService
 */
export class EDVService {
  storageInterface: EDVHTTPStorageInterface;

  private insertQueue: Promise<any> = Promise.resolve();
  public controller: string;

  rpcMethods = [
    EDVService.prototype.generateKeys,
    EDVService.prototype.deriveKeys,
    EDVService.prototype.getController,
    EDVService.prototype.initialize,
    EDVService.prototype.find,
    EDVService.prototype.update,
    EDVService.prototype.insert,
    EDVService.prototype.delete,
  ];

  constructor() {
    this.name = serviceName;
  }

  async initialize({
    hmacKey,
    agreementKey,
    verificationKey,
    edvUrl,
    authKey,
  }: InitializeEDVParams) {
    const hmac = await HMAC.create({
      key: hmacKey,
    });
    const keyAgreementKey = await X25519KeyAgreementKey2020.from(agreementKey);
    const keys = {
      keyAgreementKey,
      hmac,
    };

    const {controller} = verificationKey;
    this.controller = controller;
    const invocationSigner = getKeypairFromDoc(verificationKey);
    invocationSigner.sign = invocationSigner.signer().sign;

    this.storageInterface = new EDVHTTPStorageInterface({
      url: edvUrl,
      keys,
      invocationSigner,
      defaultHeaders: {
        DockAuth: authKey,
      },
    });

    let edvId;
    try {
      console.log('Creating EDV with controller:', controller);
      edvId = await this.storageInterface.createEdv({
        sequence: 0,
        controller,
      });
    } catch (e) {
      const existingConfig = await this.storageInterface.findConfigFor(
        controller,
      );
      edvId = existingConfig && existingConfig.id;
      if (!edvId) {
        logger.error('Unable to create or find primary EDV:');
        throw e;
      }
    }

    logger.log(`EDV found/created: ${edvId} - connecting to it`);
    this.storageInterface.connectTo(edvId);

    await this.storageInterface.client.ensureIndex({
      attribute: 'content.id',
      unique: true,
    });

    await this.storageInterface.client.ensureIndex({
      attribute: 'content.type',
    });
  }

  async generateKeys() {
    const keyPair = await didService.generateKeyDoc({});

    const verificationKey = await Ed25519VerificationKey2018.generate({
      controller: keyPair.controller,
      id: keyPair.id,
    });

    const agreementKey = await X25519KeyAgreementKey2020.generate({
      controller: keyPair.controller,
    });
    const hmacKey = await HMAC.exportKey(await HMAC.generateKey());

    return {verificationKey, agreementKey, hmacKey};
  }

  async deriveKeys(masterKey: Uint8Array) {
    const {keyPair: pair} = new Ed25519Keypair(masterKey, 'seed');

    const keyPair = await didService.deriveKeyDoc({ pair });

    const verificationKey = await Ed25519VerificationKey2018.from(keyPair);

    const verificationKey2020 = await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({ keyPair });
    const agreementKey = await X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({ keyPair: verificationKey2020 });

    const hmacKey = await HMAC.exportKey(await HMAC.deriveKey(masterKey));

    return { verificationKey, agreementKey, hmacKey };
  }

  async getController() {
    return this.controller;
  }

  find(params: any) {
    return this.storageInterface.find(params);
  }

  update(params: any) {
    return this.storageInterface.update(params);
  }

  insert(params: any) {
    this.insertQueue = this.insertQueue.then(() => {
      return this.storageInterface.insert(params).catch(error => {
        logger.error('Insert failed:', error);
        throw error;
      });
    });
    return this.insertQueue;
  }

  delete(params: any) {
    return this.storageInterface.delete(params);
  }
}

export const edvService: EDVService = new EDVService();
