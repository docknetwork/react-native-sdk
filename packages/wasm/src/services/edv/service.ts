// @ts-nocheck

/**
 * @module edv-service
 * @description Encrypted Data Vault (EDV) service for the Wallet SDK.
 * This module provides secure, encrypted storage functionality using EDV protocol,
 * enabling privacy-preserving data storage with client-side encryption.
 */

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
 * Service class for managing Encrypted Data Vaults
 * @class
 * @description Provides methods for creating, managing, and interacting with
 * encrypted data vaults for secure storage of sensitive wallet data
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

  /**
   * Creates a new EDVService instance
   * @constructor
   */
  constructor() {
    this.name = serviceName;
  }

  /**
   * Initializes the EDV service with encryption keys and connection parameters
   * @param {InitializeEDVParams} params - Initialization parameters
   * @param {Object} params.hmacKey - HMAC key for document indexing
   * @param {Object} params.agreementKey - Key agreement key for encryption
   * @param {Object} params.verificationKey - Verification key for authentication
   * @param {string} params.edvUrl - URL of the EDV server
   * @param {string} params.authKey - Authentication key for the EDV server
   * @returns {Promise<void>}
   * @throws {Error} If unable to create or connect to EDV
   * @example
   * await edvService.initialize({
   *   hmacKey: hmacKeyData,
   *   agreementKey: agreementKeyData,
   *   verificationKey: verificationKeyData,
   *   edvUrl: 'https://edv.example.com',
   *   authKey: 'auth-token-123'
   * });
   */
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

  /**
   * Generates new cryptographic keys for EDV operations
   * @returns {Promise<Object>} Generated keys
   * @returns {Object} returns.verificationKey - Ed25519 verification key for authentication
   * @returns {Object} returns.agreementKey - X25519 key agreement key for encryption
   * @returns {Object} returns.hmacKey - HMAC key for indexing
   * @example
   * const keys = await edvService.generateKeys();
   * // Use keys for EDV initialization
   * await edvService.initialize({
   *   ...keys,
   *   edvUrl: 'https://edv.example.com',
   *   authKey: 'auth-token'
   * });
   */
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

  /**
   * Derives cryptographic keys from a master key
   * @param {Uint8Array} masterKey - Master key for derivation
   * @returns {Promise<Object>} Derived keys
   * @returns {Object} returns.verificationKey - Derived Ed25519 verification key
   * @returns {Object} returns.agreementKey - Derived X25519 key agreement key
   * @returns {Object} returns.hmacKey - Derived HMAC key
   * @example
   * const masterKey = new Uint8Array(32); // Your master key
   * const keys = await edvService.deriveKeys(masterKey);
   */
  async deriveKeys(masterKey: Uint8Array) {
    const {keyPair: pair} = new Ed25519Keypair(masterKey, 'seed');

    const keyPair = await didService.deriveKeyDoc({ pair });

    const verificationKey = await Ed25519VerificationKey2018.from(keyPair);

    const verificationKey2020 = await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({ keyPair });
    const agreementKey = await X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({ keyPair: verificationKey2020 });

    const hmacKey = await HMAC.exportKey(await HMAC.deriveKey(masterKey));

    return { verificationKey, agreementKey, hmacKey };
  }

  /**
   * Gets the controller identifier for the current EDV
   * @returns {Promise<string>} The controller DID or identifier
   * @example
   * const controller = await edvService.getController();
   * console.log('EDV Controller:', controller);
   */
  async getController() {
    return this.controller;
  }

  /**
   * Finds documents in the EDV based on query parameters
   * @param {Object} params - Query parameters
   * @param {Object} [params.equals] - Equality-based query conditions
   * @param {boolean} [params.has] - Existence-based query conditions
   * @param {number} [params.limit] - Maximum number of results
   * @returns {Promise<Array>} Array of matching documents
   * @example
   * const documents = await edvService.find({
   *   equals: { 'content.type': 'VerifiableCredential' },
   *   limit: 10
   * });
   */
  find(params: any) {
    return this.storageInterface.find(params);
  }

  /**
   * Updates a document in the EDV
   * @param {Object} params - Update parameters
   * @param {string} params.id - Document ID to update
   * @param {Object} params.content - New document content
   * @returns {Promise<Object>} Updated document
   * @example
   * const updated = await edvService.update({
   *   id: 'doc-123',
   *   content: { ...existingContent, updated: true }
   * });
   */
  update(params: any) {
    return this.storageInterface.update(params);
  }

  /**
   * Inserts a new document into the EDV
   * @param {Object} params - Insert parameters
   * @param {string} params.id - Document ID
   * @param {Object} params.content - Document content to store
   * @returns {Promise<Object>} The inserted document
   * @throws {Error} If insertion fails
   * @example
   * const document = await edvService.insert({
   *   id: 'doc-456',
   *   content: {
   *     type: 'VerifiableCredential',
   *     data: credentialData
   *   }
   * });
   */
  insert(params: any) {
    this.insertQueue = this.insertQueue.then(() => {
      return this.storageInterface.insert(params).catch(error => {
        logger.error('Insert failed:', error);
        throw error;
      });
    });
    return this.insertQueue;
  }

  /**
   * Deletes a document from the EDV
   * @param {Object} params - Deletion parameters
   * @param {string} params.id - Document ID to delete
   * @returns {Promise<boolean>} True if deletion successful
   * @example
   * const deleted = await edvService.delete({
   *   id: 'doc-123'
   * });
   */
  delete(params: any) {
    return this.storageInterface.delete(params);
  }
}

/**
 * Singleton instance of the EDV service
 * @type {EDVService}
 * @example
 * import { edvService } from '@docknetwork/wallet-sdk-wasm/services/edv';
 *
 * // Generate keys and initialize
 * const keys = await edvService.generateKeys();
 * await edvService.initialize({
 *   ...keys,
 *   edvUrl: 'https://edv.example.com',
 *   authKey: 'auth-token'
 * });
 *
 * // Store encrypted data
 * await edvService.insert({
 *   id: 'credential-1',
 *   content: {
 *     type: 'VerifiableCredential',
 *     data: credentialData
 *   }
 * });
 *
 * // Query encrypted data
 * const credentials = await edvService.find({
 *   equals: { 'content.type': 'VerifiableCredential' }
 * });
 *
 * // Update encrypted data
 * await edvService.update({
 *   id: 'credential-1',
 *   content: updatedData
 * });
 */
export const edvService: EDVService = new EDVService();
