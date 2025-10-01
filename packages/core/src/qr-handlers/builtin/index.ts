/**
 * Built-in QR Code Handlers
 *
 * This module provides pre-built handlers for common protocols used in
 * decentralized identity wallets. These handlers can be used directly or
 * extended for custom behavior.
 *
 * ## Available Handlers
 *
 * - **OID4VCHandler**: OpenID for Verifiable Credentials (OID4VC)
 *
 * ## Usage
 *
 * ```typescript
 * import { OID4VCHandler } from '@docknetwork/wallet-sdk-core/src/qr-handlers/builtin';
 *
 * const handler = new OID4VCHandler({
 *   onImportCredential: async (uri) => {
 *     // Your credential import logic
 *     return { success: true };
 *   },
 * });
 *
 * processor.registerHandler(handler);
 * ```
 *
 * @module qr-handlers/builtin
 */

export * from './oid4vc-handler';