import {
  QRCodeContext,
  QRCodeHandler,
  QRCodeHandlerResult,
  QRCodeProcessor,
  ProcessOptions,
} from './types';

/**
 * Default implementation of QRCodeProcessor
 *
 * This processor manages a registry of QR code handlers and executes them
 * in priority order to process scanned QR codes. It provides a flexible,
 * extensible system for handling various types of QR codes in a wallet application.
 *
 * @example
 * ```typescript
 * const processor = new DefaultQRCodeProcessor();
 *
 * // Register handlers
 * processor.registerHandler(new OID4VCHandler());
 * processor.registerHandler(new CredentialHandler());
 *
 * // Process QR code
 * const result = await processor.process(scannedData);
 * if (result.success) {
 *   console.log('QR code processed:', result.data);
 * } else {
 *   console.error('Failed to process QR code:', result.error);
 * }
 * ```
 */
export class DefaultQRCodeProcessor implements QRCodeProcessor {
  private handlers: Map<string, QRCodeHandler> = new Map();

  /**
   * Register a new QR code handler
   *
   * @param handler - The handler to register
   * @throws Error if a handler with the same ID is already registered
   */
  registerHandler(handler: QRCodeHandler): void {
    if (this.handlers.has(handler.id)) {
      throw new Error(
        `Handler with id "${handler.id}" is already registered. ` +
          `Please use a unique ID or unregister the existing handler first.`,
      );
    }
    this.handlers.set(handler.id, handler);
  }

  /**
   * Unregister a QR code handler by its ID
   *
   * @param id - The ID of the handler to unregister
   * @returns True if the handler was found and removed, false otherwise
   */
  unregisterHandler(id: string): boolean {
    return this.handlers.delete(id);
  }

  /**
   * Get all registered handlers sorted by priority
   *
   * @returns Array of registered handlers sorted by priority (lowest first)
   */
  getHandlers(): QRCodeHandler[] {
    return Array.from(this.handlers.values()).sort(
      (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
    );
  }

  /**
   * Get a specific handler by its ID
   *
   * @param id - The ID of the handler to retrieve
   * @returns The handler if found, undefined otherwise
   */
  getHandler(id: string): QRCodeHandler | undefined {
    return this.handlers.get(id);
  }

  /**
   * Clear all registered handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Process QR code data through registered handlers
   *
   * This method:
   * 1. Prepares the context from raw QR data
   * 2. Executes handlers in priority order
   * 3. Returns the first successful result (or continues if stopOnFirstSuccess is false)
   * 4. Returns an error result if no handler can process the data
   *
   * @param data - Raw QR code data string
   * @param options - Processing options
   * @returns Result of the processing
   */
  async process(
    data: string,
    options: ProcessOptions = {},
  ): Promise<QRCodeHandlerResult> {
    const {
      timeout = 30000,
      stopOnFirstSuccess = true,
      prepareContext = this.defaultPrepareContext.bind(this),
      onError,
      onSuccess,
    } = options;

    // Prepare context from raw data
    let context: QRCodeContext;
    try {
      context = await this.withTimeout(prepareContext(data), timeout);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {phase: 'context-preparation'},
      };
    }

    // Get sorted handlers
    const handlers = this.getHandlers();

    if (handlers.length === 0) {
      return {
        success: false,
        error: new Error('No handlers registered'),
        metadata: {phase: 'handler-execution'},
      };
    }

    let lastError: Error | undefined;
    const attemptedHandlers: string[] = [];

    // Execute handlers in priority order
    for (const handler of handlers) {
      try {
        // Check if handler can process this data
        const canHandle = await this.withTimeout(
          Promise.resolve(handler.canHandle(context)),
          timeout,
        );

        if (!canHandle) {
          continue;
        }

        attemptedHandlers.push(handler.id);

        // Execute handler
        const result = await this.withTimeout(handler.handle(context), timeout);

        // Call success callback if provided
        if (result.success && onSuccess) {
          try {
            onSuccess(result, handler);
          } catch (callbackError) {
            console.error(
              `Success callback error for handler ${handler.id}:`,
              callbackError,
            );
          }
        }

        // Stop on first success if configured
        if (result.success && stopOnFirstSuccess) {
          return {
            ...result,
            metadata: {
              ...result.metadata,
              handlerId: handler.id,
              attemptedHandlers,
            },
          };
        }

        // Store error if handler failed
        if (!result.success && result.error) {
          lastError = result.error;
        }
      } catch (error) {
        const handlerError =
          error instanceof Error ? error : new Error(String(error));
        lastError = handlerError;

        // Call error callback if provided
        if (onError) {
          try {
            onError(handlerError, handler);
          } catch (callbackError) {
            console.error(
              `Error callback error for handler ${handler.id}:`,
              callbackError,
            );
          }
        }

        // Continue to next handler
        continue;
      }
    }

    // No handler could process the data
    return {
      success: false,
      error:
        lastError ||
        new Error(
          `No handler could process the QR code. Attempted handlers: ${attemptedHandlers.join(', ') || 'none'}`,
        ),
      metadata: {
        phase: 'handler-execution',
        attemptedHandlers,
      },
    };
  }

  /**
   * Default context preparation function
   *
   * This method attempts to parse the raw QR data as JSON or URL.
   * Override this by providing a custom prepareContext function in ProcessOptions.
   *
   * @param data - Raw QR code data string
   * @returns Prepared context object
   */
  private async defaultPrepareContext(data: string): Promise<QRCodeContext> {
    const context: QRCodeContext = {data};

    // Try to parse as URL
    try {
      // Basic URL validation
      if (data.startsWith('http://') || data.startsWith('https://')) {
        const url = new URL(data);
        context.url = data;
        context.parsedUrl = data;
      }
    } catch {
      // Not a valid URL, continue
    }

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(data);
      context.jsonData = parsed;
    } catch {
      // Not valid JSON, continue
    }

    return context;
  }

  /**
   * Execute a promise with a timeout
   *
   * @param promise - Promise to execute
   * @param timeoutMs - Timeout in milliseconds
   * @returns Result of the promise
   * @throws Error if the promise times out
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  }
}

/**
 * Create a new QR code processor instance
 *
 * This is a convenience factory function for creating a processor.
 *
 * @param handlers - Optional array of handlers to register immediately
 * @returns New processor instance with handlers registered
 *
 * @example
 * ```typescript
 * const processor = createQRCodeProcessor([
 *   new OID4VCHandler(),
 *   new CredentialHandler(),
 * ]);
 * ```
 */
export function createQRCodeProcessor(
  handlers?: QRCodeHandler[],
): QRCodeProcessor {
  const processor = new DefaultQRCodeProcessor();

  if (handlers) {
    for (const handler of handlers) {
      processor.registerHandler(handler);
    }
  }

  return processor;
}