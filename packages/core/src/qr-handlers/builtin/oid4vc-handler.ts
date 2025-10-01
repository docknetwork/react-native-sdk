import {
  QRCodeContext,
  QRCodeHandler,
  QRCodeHandlerResult,
} from '../types';

/**
 * Configuration options for OID4VC handler
 */
export interface OID4VCHandlerConfig {
  /**
   * URI prefixes to match (default: ['openid-credential-offer://'])
   */
  uriPrefixes?: string[];

  /**
   * Priority for this handler (default: 5)
   */
  priority?: number;

  /**
   * Callback to handle credential import
   * This is where app-specific logic (navigation, UI, etc.) should be implemented
   *
   * @param uri - The OID4VC URI to process
   * @param context - The full QR code context
   * @returns Result of the import operation
   */
  onImportCredential: (
    uri: string,
    context: QRCodeContext,
  ) => Promise<OID4VCImportResult>;
}

/**
 * Result from importing an OID4VC credential
 */
export interface OID4VCImportResult {
  /**
   * Whether the import was successful
   */
  success: boolean;

  /**
   * Credential data if import succeeded
   */
  credential?: any;

  /**
   * Error if import failed
   */
  error?: Error;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Built-in handler for OID4VC (OpenID for Verifiable Credentials) URIs
 *
 * This is a generic handler that can be configured with app-specific callbacks
 * for importing credentials. The handler itself only handles protocol detection
 * and delegates the actual import logic to the configured callback.
 *
 * ## Example Usage
 *
 * ```typescript
 * import { OID4VCHandler } from '@docknetwork/wallet-sdk-core/src/qr-handlers/builtin';
 * import { getCredentialProvider } from '@docknetwork/wallet-sdk-react-native';
 *
 * const handler = new OID4VCHandler({
 *   onImportCredential: async (uri, context) => {
 *     try {
 *       // Use SDK to import credential
 *       await getCredentialProvider().importCredentialFromURI({
 *         uri,
 *         didProvider: getDIDProvider(),
 *         getAuthCode: async (authUrl) => {
 *           // App-specific auth handling
 *           return await showAuthWebView(authUrl);
 *         },
 *       });
 *
 *       return { success: true };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: error instanceof Error ? error : new Error(String(error)),
 *       };
 *     }
 *   },
 * });
 *
 * processor.registerHandler(handler);
 * ```
 *
 * ## Handler Priority
 *
 * Default priority: 5 (very high)
 * This ensures OID4VC URIs are checked before other credential handlers.
 *
 * @category Built-in Handlers
 */
export class OID4VCHandler implements QRCodeHandler {
  id = 'oid4vc';
  priority: number;

  private uriPrefixes: string[];
  private onImportCredential: (
    uri: string,
    context: QRCodeContext,
  ) => Promise<OID4VCImportResult>;

  constructor(config: OID4VCHandlerConfig) {
    if (!config.onImportCredential) {
      throw new Error('onImportCredential callback is required');
    }

    this.priority = config.priority ?? 5;
    this.uriPrefixes = config.uriPrefixes ?? ['openid-credential-offer://'];
    this.onImportCredential = config.onImportCredential;
  }

  /**
   * Check if this is an OID4VC URI
   *
   * Matches URIs that start with any of the configured prefixes.
   * By default, matches: openid-credential-offer://
   *
   * @param context - The QR code context
   * @returns True if this handler can process the URI
   */
  canHandle(context: QRCodeContext): boolean {
    return this.uriPrefixes.some(prefix => context.data.startsWith(prefix));
  }

  /**
   * Process the OID4VC credential offer URI
   *
   * Delegates to the configured onImportCredential callback for actual processing.
   * This allows apps to implement their own navigation, UI, and error handling.
   *
   * @param context - The QR code context
   * @returns Result of the processing
   */
  async handle(context: QRCodeContext): Promise<QRCodeHandlerResult> {
    try {
      const result = await this.onImportCredential(context.data, context);

      return {
        success: result.success,
        data: result.credential,
        error: result.error,
        metadata: {
          type: 'oid4vc',
          uri: context.data,
          ...result.metadata,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: err,
        metadata: {
          type: 'oid4vc',
          uri: context.data,
        },
      };
    }
  }
}

/**
 * Create an OID4VC handler with custom configuration
 *
 * This is a convenience factory function for creating an OID4VC handler.
 *
 * @param config - Handler configuration
 * @returns Configured OID4VC handler
 *
 * @example
 * ```typescript
 * const handler = createOID4VCHandler({
 *   onImportCredential: async (uri) => {
 *     // Your import logic
 *     return { success: true };
 *   },
 * });
 * ```
 */
export function createOID4VCHandler(
  config: OID4VCHandlerConfig,
): OID4VCHandler {
  return new OID4VCHandler(config);
}