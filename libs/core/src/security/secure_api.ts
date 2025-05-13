/**
 * @file Secure API Implementation Example
 * @description This module demonstrates secure API implementation patterns for the Claude Neural Framework.
 * It should be used as a reference for implementing secure APIs within the framework.
 */

import crypto from 'crypto';
import { promisify } from 'util';

// Import standardized config manager
// TODO: Sicherstellen, dass config_manager nach TypeScript migriert wurde und korrekte Typen exportiert
import configManager, { ConfigType } from '../config/config-manager';

// Import standardized logger
// TODO: Sicherstellen, dass logger nach TypeScript migriert wurde und korrekte Typen exportiert
import { createLogger, Logger } from '../logging/logger';

// Import error handler
// TODO: Sicherstellen, dass error_handler nach TypeScript migriert wurde und korrekte Typen exportiert
import { ValidationError, FrameworkError } from '../error/error_handler.js'; // Annahme .js bis migriert

// Import internationalization
// TODO: Sicherstellen, dass i18n nach TypeScript migriert wurde und korrekte Typen exportiert
import { I18n } from '../i18n/i18n.js'; // Annahme .js bis migriert

import {
  SecureApiOptions,
  MockRequest,
  MockResponse,
  FormattedErrorResponse,
} from './security.types';

const logger: Logger = createLogger('secure-api');
const randomBytesAsync = promisify(crypto.randomBytes);
const scryptAsync = promisify(crypto.scrypt);

/**
 * Type for a request handler function.
 * Adjust `any` to more specific types if your framework (e.g., Express) provides them.
 */
type RequestHandler = (req: MockRequest, res: MockResponse, ...args: any[]) => Promise<any>;

/**
 * Secure API base class with security best practices.
 */
export class SecureAPI {
  private readonly i18n: I18n;
  private readonly options: Required<SecureApiOptions>;
  private readonly rateLimitState: Map<string, { requests: number; windowStart: number }>;
  private readonly securityHeaders: Record<string, string>;

  /**
   * Creates a new secure API instance.
   * @param options - Configuration options.
   */
  constructor(options: SecureApiOptions = {}) {
    this.i18n = new I18n();

    this.options = {
      rateLimitRequests: options.rateLimitRequests ?? 100,
      rateLimitWindowMs: options.rateLimitWindowMs ?? 15 * 60 * 1000, // 15 minutes
      sessionTimeoutMs: options.sessionTimeoutMs ?? 30 * 60 * 1000, // 30 minutes
      requireHTTPS: options.requireHTTPS ?? true,
      csrfProtection: options.csrfProtection ?? true,
      secureHeaders: options.secureHeaders ?? true,
      inputValidation: options.inputValidation ?? true,
      ...options,
    };

    this.rateLimitState = new Map();
    this.securityHeaders = {
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
    };

    logger.info(this.i18n.translate('security.apiInitialized'), {
      options: this.options,
    });
  }

  /**
   * Applies security middleware to a request handler.
   * @param handler - The request handler function.
   * @returns A new, secured request handler function.
   */
  public secureHandler(handler: RequestHandler): RequestHandler {
    return async (req: MockRequest, res: MockResponse, ...args: any[]): Promise<any> => {
      try {
        if (this.options.requireHTTPS && !req.secure) {
          throw new ValidationError(this.i18n.translate('errors.httpsRequired'));
        }

        if (this.options.secureHeaders) {
          this.applySecurityHeaders(res);
        }

        if (!this.checkRateLimit(req)) {
          throw new ValidationError(this.i18n.translate('errors.rateLimitExceeded'), {
            status: 429, // Explicitly use the correct type from error_handler if available
            metadata: { // Same here for metadata
              retryAfter: this.getRateLimitReset(req),
            },
          } as any); // Cast as any if ValidationError constructor doesn't match
        }

        if (this.options.csrfProtection && !this.validateCSRF(req)) {
          throw new ValidationError(this.i18n.translate('errors.invalidCsrfToken'), {
            status: 403,
          } as any);
        }

        if (this.options.inputValidation) {
          this.validateInput(req); // This method should be implemented by subclasses
        }

        return await handler(req, res, ...args);
      } catch (error: any) {
        logger.error(this.i18n.translate('errors.requestError'), { error: error.message });
        const formattedError = this.formatErrorResponse(error);
        res.status(formattedError.status || 500).json({ error: formattedError });
      }
    };
  }

  /**
   * Applies security headers to the response.
   * @param res - The response object.
   * @private
   */
  private applySecurityHeaders(res: MockResponse): void {
    Object.entries(this.securityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
  }

  /**
   * Checks rate limiting for the request.
   * @param req - The request object.
   * @returns True if the request is within rate limits, false otherwise.
   * @private
   */
  private checkRateLimit(req: MockRequest): boolean {
    const clientId = this.getClientId(req);
    const now = Date.now();
    let clientState = this.rateLimitState.get(clientId);

    if (!clientState) {
      clientState = { requests: 0, windowStart: now };
      this.rateLimitState.set(clientId, clientState);
    }

    if (now - clientState.windowStart > this.options.rateLimitWindowMs) {
      clientState.requests = 0;
      clientState.windowStart = now;
    }

    clientState.requests++;
    return clientState.requests <= this.options.rateLimitRequests;
  }

  /**
   * Gets when the rate limit will reset for a client.
   * @param req - The request object.
   * @returns Milliseconds until rate limit reset.
   * @private
   */
  private getRateLimitReset(req: MockRequest): number {
    const clientId = this.getClientId(req);
    const clientState = this.rateLimitState.get(clientId);
    if (!clientState) {
      return 0;
    }
    return Math.max(0, this.options.rateLimitWindowMs - (Date.now() - clientState.windowStart));
  }

  /**
   * Gets a unique identifier for the client.
   * @param req - The request object.
   * @returns The client identifier string.
   * @private
   */
  private getClientId(req: MockRequest): string {
    const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown_ip';
    const userAgent = req.headers['user-agent'] || '';
    return crypto
      .createHash('sha256')
      .update(`${clientIp}:${userAgent}`)
      .digest('hex');
  }

  /**
   * Validates the CSRF token.
   * @param req - The request object.
   * @returns True if the CSRF token is valid, false otherwise.
   * @private
   */
  private validateCSRF(req: MockRequest): boolean {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method?.toUpperCase() || '')) {
      return true;
    }
    const requestToken = req.headers['x-csrf-token'] || req.body?._csrf || req.query?._csrf;
    const sessionToken = req.session?.csrfToken;
    return !!requestToken && !!sessionToken && requestToken === sessionToken;
  }

  /**
   * Validates request input. This method should be overridden by subclasses
   * to implement specific validation logic.
   * @param req - The request object.
   * @throws {ValidationError} If validation fails.
   * @protected
   */
  protected validateInput(req: MockRequest): void {
    // Default implementation does nothing. Subclasses should override this.
    logger.debug('SecureAPI.validateInput called, but no specific validation implemented in base class.');
  }

  /**
   * Formats an error response.
   * @param error - The error object.
   * @returns A formatted error response object.
   * @private
   */
  private formatErrorResponse(error: any): FormattedErrorResponse {
    if (error instanceof FrameworkError) { // Use FrameworkError if it's the base for ValidationError
      return {
        message: error.message,
        code: error.code,
        status: error.status,
        component: error.component,
        // Include retryAfter if it's a rate limit error and metadata exists
        ...(error.metadata?.retryAfter && { retryAfter: error.metadata.retryAfter }),
      };
    }
    return {
      message: error.message || this.i18n.translate('errors.unexpectedError'),
      code: 'ERR_UNKNOWN',
      status: 500,
    };
  }

  /**
   * Generates a secure random token.
   * @param bytes - The number of random bytes to generate. Defaults to 32.
   * @returns A promise that resolves with the random token string.
   */
  public async generateSecureToken(bytes = 32): Promise<string> {
    const buffer = await randomBytesAsync(bytes);
    return buffer.toString('hex');
  }

  /**
   * Hashes a password securely using scrypt.
   * @param password - The password to hash.
   * @param salt - Optional salt. If not provided, a new salt will be generated.
   * @returns A promise that resolves with an object containing the hash and salt.
   */
  public async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const currentSalt = salt || (await randomBytesAsync(16)).toString('hex');
    const derivedKey = (await scryptAsync(password, currentSalt, 64)) as Buffer;
    return {
      hash: derivedKey.toString('hex'),
      salt: currentSalt,
    };
  }

  /**
   * Verifies a password against a stored hash and salt.
   * @param password - The password to verify.
   * @param hash - The stored password hash.
   * @param salt - The salt used for hashing.
   * @returns A promise that resolves with true if the password matches, false otherwise.
   */
  public async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: inputHash } = await this.hashPassword(password, salt);
    // Ensure buffers have the same length for timingSafeEqual
    const hashBuffer = Buffer.from(hash, 'hex');
    const inputHashBuffer = Buffer.from(inputHash, 'hex');

    if (hashBuffer.length !== inputHashBuffer.length) {
      // Mitigate timing attacks by performing a dummy comparison
      // if lengths are different. This is a common practice.
      crypto.timingSafeEqual(hashBuffer, hashBuffer);
      return false;
    }
    return crypto.timingSafeEqual(inputHashBuffer, hashBuffer);
  }
}