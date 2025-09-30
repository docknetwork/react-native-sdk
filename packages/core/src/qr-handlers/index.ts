/**
 * QR Code Handler System
 *
 * This module provides a generic, extensible system for processing QR codes
 * in decentralized identity wallet applications.
 *
 * ## Overview
 *
 * The QR handler system is built around these core concepts:
 *
 * - **QRCodeContext**: Contains parsed QR data (raw string, JSON, URLs)
 * - **QRCodeHandler**: Interface for implementing specific QR code processors
 * - **QRCodeProcessor**: Manages handler registration and execution
 * - **ProcessOptions**: Configuration for how QR codes are processed
 *
 * ## Basic Usage
 *
 * ```typescript
 * import { createQRCodeProcessor } from '@docknetwork/wallet-sdk-core';
 *
 * // Create processor
 * const processor = createQRCodeProcessor();
 *
 * // Register handlers
 * processor.registerHandler({
 *   id: 'my-handler',
 *   priority: 10,
 *   canHandle: (context) => context.data.startsWith('myprotocol://'),
 *   handle: async (context) => {
 *     // Process the QR code
 *     return { success: true };
 *   }
 * });
 *
 * // Process QR code
 * const result = await processor.process(scannedData);
 * ```
 *
 * ## Custom Handlers
 *
 * Handlers can be implemented as classes or objects:
 *
 * ```typescript
 * class MyCustomHandler implements QRCodeHandler {
 *   id = 'my-custom-handler';
 *   priority = 20;
 *
 *   canHandle(context: QRCodeContext): boolean {
 *     return context.jsonData?.type === 'my-type';
 *   }
 *
 *   async handle(context: QRCodeContext): Promise<QRCodeHandlerResult> {
 *     // Your processing logic
 *     return { success: true, data: processedData };
 *   }
 * }
 *
 * processor.registerHandler(new MyCustomHandler());
 * ```
 *
 * ## Built-in Handlers
 *
 * The SDK provides built-in handlers for common protocols:
 * - OID4VC (OpenID for Verifiable Credentials)
 * - OID4VP (OpenID for Verifiable Presentations)
 * - DIDComm (Decentralized Identity Communication)
 *
 * These handlers are available in separate modules and can be imported
 * and registered as needed.
 *
 * @module qr-handlers
 */

export * from './types';
export * from './processor';
export * from './builtin';