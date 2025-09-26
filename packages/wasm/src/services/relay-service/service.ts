/**
 * @module relay-service
 * @description DIDComm message relay service for the Wallet SDK.
 * This module provides functionality for sending, receiving, and managing DIDComm messages
 * through a relay service, including push notification support.
 */

import {
  SendMessageParams,
  GetMessagesParams,
  ResolveDidcommMessageParams,
  RegisterDIDPushNotificationParams,
  serviceName,
  validation,
  AckMessagesParams,
} from './configs';

import {RelayService as relayServiceClient} from '@docknetwork/wallet-sdk-relay-service/src';

/**
 * Service class for managing DIDComm message relay operations
 * @class
 * @description Provides methods for sending, receiving, and acknowledging DIDComm messages
 * through a relay service infrastructure
 */
export class RelayService {
  name: string;

  rpcMethods = [
    RelayService.prototype.ackMessages,
    RelayService.prototype.getMessages,
    RelayService.prototype.registerDIDPushNotification,
    RelayService.prototype.resolveDidcommMessage,
    RelayService.prototype.sendMessage,
    RelayService.prototype.signJwt,
  ];

  /**
   * Creates a new RelayService instance
   * @constructor
   */
  constructor() {
    this.name = serviceName;
  }

  /**
   * Sends a DIDComm message through the relay service
   * @param {SendMessageParams} params - Message parameters
   * @param {Object} params.keyPairDoc - Key pair document for message encryption
   * @param {Object} params.message - The message payload to send
   * @param {string} params.recipientDid - DID of the message recipient
   * @param {string} [params.type] - Message type identifier
   * @returns {Promise<Object>} Result of the send operation
   * @throws {Error} If validation fails or sending fails
   * @example
   * const result = await relayService.sendMessage({
   *   keyPairDoc: senderKeyPair,
   *   message: { content: 'Hello' },
   *   recipientDid: 'did:key:recipient123',
   *   type: 'basic-message'
   * });
   */
  sendMessage(params: SendMessageParams) {
    validation.sendMessage(params);
    return relayServiceClient.sendMessage(params as any);
  }

  /**
   * Acknowledges receipt of messages from the relay service
   * @param {AckMessagesParams} params - Acknowledgment parameters
   * @param {string} params.did - DID acknowledging the messages
   * @param {Array<string>} params.messageIds - Array of message IDs to acknowledge
   * @returns {Promise<Object>} Result of the acknowledgment operation
   * @example
   * await relayService.ackMessages({
   *   did: 'did:key:holder123',
   *   messageIds: ['msg-1', 'msg-2']
   * });
   */
  ackMessages(params: AckMessagesParams) {
    return relayServiceClient.ackMessages(params);
  }

  /**
   * Resolves and decrypts a DIDComm message
   * @param {ResolveDidcommMessageParams} params - Resolution parameters
   * @param {Object} params.encryptedMessage - The encrypted message to resolve
   * @param {Object} params.keyPairDoc - Key pair document for decryption
   * @returns {Promise<Object>} The decrypted and resolved message
   * @throws {Error} If validation fails or resolution fails
   * @example
   * const decrypted = await relayService.resolveDidcommMessage({
   *   encryptedMessage: encryptedData,
   *   keyPairDoc: recipientKeyPair
   * });
   */
  resolveDidcommMessage(params: ResolveDidcommMessageParams) {
    validation.resolveDidcommMessage(params);
    return relayServiceClient.resolveDidcommMessage(params);
  }

  /**
   * Signs a JWT using the provided key pair
   * @param {ResolveDidcommMessageParams} params - Signing parameters
   * @param {Object} params.payload - JWT payload to sign
   * @param {Object} params.keyPairDoc - Key pair document for signing
   * @returns {Promise<string>} The signed JWT token
   * @throws {Error} If validation fails or signing fails
   * @example
   * const jwt = await relayService.signJwt({
   *   payload: { sub: 'did:key:123', iat: Date.now() },
   *   keyPairDoc: signerKeyPair
   * });
   */
  signJwt(params: ResolveDidcommMessageParams) {
    validation.signJwt(params);
    return relayServiceClient.signJwt(params);
  }

  /**
   * Retrieves messages from the relay service
   * @param {GetMessagesParams} params - Retrieval parameters
   * @param {Object} params.keyPairDocs - Key pair documents for decryption
   * @param {number} [params.limit] - Maximum number of messages to retrieve
   * @param {boolean} [params.skipMessageResolution] - Whether to skip message resolution
   * @returns {Promise<Array>} Array of retrieved messages
   * @throws {Error} If validation fails or retrieval fails
   * @example
   * const messages = await relayService.getMessages({
   *   keyPairDocs: [keyPairDoc1, keyPairDoc2],
   *   limit: 50,
   *   skipMessageResolution: false
   * });
   */
  getMessages(params: GetMessagesParams) {
    validation.getMessages(params);
    return relayServiceClient.getMessages(params);
  }

  /**
   * Registers a DID for push notifications
   * @param {RegisterDIDPushNotificationParams} params - Registration parameters
   * @param {string} params.did - The DID to register for notifications
   * @param {string} params.deviceToken - Device token for push notifications
   * @param {string} [params.platform] - Platform identifier (ios, android, etc.)
   * @returns {Promise<Object>} Result of the registration
   * @throws {Error} If validation fails or registration fails
   * @example
   * await relayService.registerDIDPushNotification({
   *   did: 'did:key:holder123',
   *   deviceToken: 'fcm-token-123',
   *   platform: 'android'
   * });
   */
  registerDIDPushNotification(params: RegisterDIDPushNotificationParams) {
    validation.registerDIDPushNotification(params);
    return relayServiceClient.registerDIDPushNotification(params);
  }
}

/**
 * Low-level relay service client for direct API access
 * @type {Object}
 * @see {@link RelayService} - Higher-level service wrapper
 */
export {relayServiceClient};

/**
 * Singleton instance of the relay service
 * @type {RelayService}
 * @example
 * import { relayService } from '@docknetwork/wallet-sdk-wasm/services/relay-service';
 *
 * // Send a DIDComm message
 * await relayService.sendMessage({
 *   keyPairDoc: senderKeyPair,
 *   message: { type: 'greeting', content: 'Hello!' },
 *   recipientDid: 'did:key:recipient123'
 * });
 *
 * // Retrieve messages
 * const messages = await relayService.getMessages({
 *   keyPairDocs: [recipientKeyPair],
 *   limit: 10
 * });
 *
 * // Acknowledge messages
 * await relayService.ackMessages({
 *   did: 'did:key:recipient123',
 *   messageIds: messages.map(m => m.id)
 * });
 */
export const relayService: RelayService = new RelayService();
