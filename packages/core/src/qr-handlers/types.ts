/**
 * QR Code Handler Types
 *
 * This module provides interfaces and types for building a generic,
 * extensible QR code handler system that can process various types
 * of QR codes in a decentralized identity wallet.
 */

/**
 * Context object containing parsed QR code data and metadata
 *
 * @interface QRCodeContext
 */
export interface QRCodeContext {
  /**
   * Raw scanned QR code data string
   */
  data: string;

  /**
   * Parsed JSON data if the QR code contained JSON,
   * or data fetched from a URL if the QR code was a URL
   */
  jsonData?: any;

  /**
   * Original URL if the scanned data was a valid URL
   */
  url?: string;

  /**
   * Modified URL after processing (e.g., with authentication parameters added)
   */
  parsedUrl?: string;

  /**
   * Additional metadata that can be attached by context preparation
   * or handlers for passing data between handlers
   */
  metadata?: Record<string, any>;
}

/**
 * Result returned by a QR code handler after processing
 *
 * @interface QRCodeHandlerResult
 */
export interface QRCodeHandlerResult {
  /**
   * Whether the handler successfully processed the QR code data
   */
  success: boolean;

  /**
   * Optional data returned by the handler
   * Can be credentials, presentation requests, or any other processed data
   */
  data?: any;

  /**
   * Error object if processing failed
   */
  error?: Error;

  /**
   * Additional metadata about the processing result
   */
  metadata?: Record<string, any>;
}

/**
 * Handler interface for processing specific types of QR codes
 *
 * Handlers are responsible for:
 * 1. Identifying if they can process the QR code (canHandle)
 * 2. Processing the QR code data (handle)
 *
 * @interface QRCodeHandler
 */
export interface QRCodeHandler {
  /**
   * Unique identifier for this handler
   * Used for registration, unregistration, and debugging
   */
  id: string;

  /**
   * Priority for handler execution (lower number = higher priority)
   * Handlers are executed in priority order until one successfully handles the data
   *
   * @default 100
   */
  priority?: number;

  /**
   * Check if this handler can process the given QR code data
   *
   * This method should be fast and only do basic checks (string matching, type checking)
   * without performing expensive operations like network requests.
   *
   * @param context - The QR code context containing parsed data
   * @returns True if this handler can process the data, false otherwise
   */
  canHandle(context: QRCodeContext): boolean | Promise<boolean>;

  /**
   * Process the QR code data
   *
   * This method is only called if canHandle returns true.
   * It should perform the actual processing logic (navigation, API calls, etc.)
   *
   * @param context - The QR code context containing parsed data
   * @returns Result of the processing including success status and any data/errors
   */
  handle(context: QRCodeContext): Promise<QRCodeHandlerResult>;
}

/**
 * Options for processing QR codes
 *
 * @interface ProcessOptions
 */
export interface ProcessOptions {
  /**
   * Timeout in milliseconds for processing
   * If a handler takes longer than this, it will be skipped
   *
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Whether to stop processing after the first successful handler
   * If false, all handlers will be tried even after one succeeds
   *
   * @default true
   */
  stopOnFirstSuccess?: boolean;

  /**
   * Custom context preparation function
   *
   * This function is called before any handlers to prepare the context
   * from the raw scanned data. It can fetch data from URLs, parse JSON,
   * add metadata, etc.
   *
   * @param data - Raw QR code data string
   * @returns Prepared context object
   */
  prepareContext?: (data: string) => Promise<QRCodeContext>;

  /**
   * Error handler callback
   *
   * Called when a handler throws an error during processing.
   * Useful for logging, analytics, or custom error handling.
   *
   * @param error - The error that was thrown
   * @param handler - The handler that threw the error
   */
  onError?: (error: Error, handler: QRCodeHandler) => void;

  /**
   * Success callback
   *
   * Called when a handler successfully processes the QR code.
   * Useful for logging, analytics, or side effects.
   *
   * @param result - The result returned by the handler
   * @param handler - The handler that processed the data
   */
  onSuccess?: (result: QRCodeHandlerResult, handler: QRCodeHandler) => void;
}

/**
 * Main processor interface for managing and executing QR code handlers
 *
 * @interface QRCodeProcessor
 */
export interface QRCodeProcessor {
  /**
   * Register a new QR code handler
   *
   * @param handler - The handler to register
   * @throws Error if a handler with the same ID is already registered
   */
  registerHandler(handler: QRCodeHandler): void;

  /**
   * Unregister a QR code handler by its ID
   *
   * @param id - The ID of the handler to unregister
   * @returns True if the handler was found and removed, false otherwise
   */
  unregisterHandler(id: string): boolean;

  /**
   * Get all registered handlers sorted by priority
   *
   * @returns Array of registered handlers sorted by priority (lowest first)
   */
  getHandlers(): QRCodeHandler[];

  /**
   * Get a specific handler by its ID
   *
   * @param id - The ID of the handler to retrieve
   * @returns The handler if found, undefined otherwise
   */
  getHandler(id: string): QRCodeHandler | undefined;

  /**
   * Process QR code data through registered handlers
   *
   * Handlers are executed in priority order until one successfully
   * processes the data (or all handlers are tried if stopOnFirstSuccess is false)
   *
   * @param data - Raw QR code data string
   * @param options - Processing options
   * @returns Result of the processing
   */
  process(data: string, options?: ProcessOptions): Promise<QRCodeHandlerResult>;

  /**
   * Clear all registered handlers
   */
  clearHandlers(): void;
}