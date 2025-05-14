/**
 * @file Tests for the SecureAPI module
 * @description Ensures that the SecureAPI class correctly applies security measures.
 */

import { SecureAPI } from './secure_api';
// Verwende die gemockten Fehlerklassen, wenn error_handler.ts noch nicht migriert ist
// oder importiere die echten Fehlerklassen, wenn sie bereits als TS existieren.
import { ValidationError, FrameworkError } from '../error/error_handler.js'; // Annahme .js
import type { MockRequest, MockResponse, SecureApiOptions } from './security.types';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../logging/logger', () => ({
  createLogger: jest.fn().mockReturnValue({ // createLogger statt Logger-Klasse direkt
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('../config/config-manager', () => ({
  __esModule: true, // Wichtig für ES Modules Default Export Mock
  ConfigType: { // Enum muss hier gemockt werden, wenn es von SecureAPI genutzt wird
    SECURITY: 'security',
    // Weitere benötigte ConfigTypes
  },
  default: { // Mock des Singleton-Exports
    getConfig: jest.fn().mockReturnValue({
      // Stelle sicher, dass die gemockte Config die Struktur hat, die SecureAPI erwartet
      // Z.B. wenn SecureAPI auf this.config.mcp zugreift
      mcp: { allowed_servers: [] },
      // Weitere benötigte Config-Properties
    }),
    // TODO: defaultValue genauer typisieren, falls möglich, basierend auf der Verwendung in SecureAPI
    getConfigValue: jest.fn((type: string /* ConfigType */, key: string, defaultValue: any) => defaultValue ?? '1.0.0'),
  },
}));

jest.mock('../i18n/i18n.js', () => ({
  I18n: jest.fn().mockImplementation(() => ({
    translate: jest.fn().mockImplementation((...args: any[]) => { // Akzeptiert beliebige Argumente
      // Für Testzwecke geben wir einfach den ersten Parameter zurück (typischerweise der Key)
      // oder einen leeren String, falls keine Argumente vorhanden sind.
      return args.length > 0 && typeof args[0] === 'string' ? args[0] : 'mocked.translation.key';
    }),
  })),
}));

describe('SecureAPI', () => {
  let secureApi: SecureAPI;

  // Helper to create mock request objects
  const mockRequest = (options: Partial<MockRequest> = {}): MockRequest => ({
    method: 'GET',
    headers: {},
    secure: true,
    connection: { remoteAddress: '127.0.0.1' },
    body: {},
    query: {},
    session: { csrfToken: 'test-session-csrf-token' }, // Beispiel CSRF-Token
    ...options,
  });

  // Helper to create mock response objects
  const mockResponse = (): MockResponse => {
    const res: Partial<MockResponse> = {};
    res.setHeader = jest.fn();
    // Korrekte Typisierung für jest.fn(), das eine Funktion zurückgibt
    res.status = jest.fn<(code: number) => MockResponse>().mockImplementation(() => res as MockResponse);
    res.json = jest.fn<(body: unknown) => MockResponse>().mockImplementation(() => res as MockResponse);
    return res as MockResponse;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    secureApi = new SecureAPI();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(secureApi).toBeInstanceOf(SecureAPI);
      // @ts-ignore // Zugriff auf private options für Testzwecke
      expect(secureApi.options.rateLimitRequests).toBe(100);
    });

    it('should initialize with custom options', () => {
      const customOptions: SecureApiOptions = {
        rateLimitRequests: 50,
        requireHTTPS: false,
        // policyLevel wurde entfernt, da es nicht direkt in SecureApiOptions ist
      };
      const customApi = new SecureAPI(customOptions);
      expect(customApi).toBeInstanceOf(SecureAPI);
      // @ts-ignore
      expect(customApi.options.rateLimitRequests).toBe(50);
      // @ts-ignore
      expect(customApi.options.requireHTTPS).toBe(false);
    });
  });

  describe('secureHandler', () => {
    // Korrekte Typisierung für jest.fn(): Funktion, die ein Promise von string zurückgibt
    const mockHandler = jest.fn<() => Promise<string>>();

    beforeEach(() => {
        mockHandler.mockResolvedValue('success');
    });

    it('should apply security headers if enabled', async () => {
      const apiWithHeaders = new SecureAPI({ secureHeaders: true });
      const req = mockRequest();
      const res = mockResponse();
      const securedHandler = apiWithHeaders.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should not apply security headers if disabled', async () => {
      const apiWithoutHeaders = new SecureAPI({ secureHeaders: false });
      const req = mockRequest();
      const res = mockResponse();
      const securedHandler = apiWithoutHeaders.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(res.setHeader).not.toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });


    it('should reject non-HTTPS requests when required', async () => {
      const req = mockRequest({ secure: false });
      const res = mockResponse();
      const securedHandler = secureApi.secureHandler(mockHandler); // secureApi hat requireHTTPS: true per Default

      await securedHandler(req, res);
      expect(mockHandler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400); // ValidationError default status
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'errors.httpsRequired' }),
        })
      );
    });

    it('should allow HTTP requests when requireHTTPS is false', async () => {
      const lenientApi = new SecureAPI({ requireHTTPS: false });
      const req = mockRequest({ secure: false });
      const res = mockResponse();
      const securedHandler = lenientApi.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(mockHandler).toHaveBeenCalled();
    });


    it('should handle rate limiting', async () => {
      const lowLimitApi = new SecureAPI({ rateLimitRequests: 1, rateLimitWindowMs: 60000 });
      const req = mockRequest();
      const res = mockResponse();
      const securedHandler = lowLimitApi.secureHandler(mockHandler);

      // First request
      await securedHandler(req, res);
      expect(mockHandler).toHaveBeenCalledTimes(1);

      // Second request (should be rate-limited)
      const res2 = mockResponse(); // Neues Response-Objekt für den zweiten Aufruf
      await securedHandler(req, res2);
      expect(mockHandler).toHaveBeenCalledTimes(1); // Handler wurde nicht erneut aufgerufen
      expect(res2.status).toHaveBeenCalledWith(429);
      expect(res2.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'errors.rateLimitExceeded' }),
        })
      );
    });

    it('should validate CSRF tokens for non-safe methods (POST)', async () => {
      const req = mockRequest({
        method: 'POST',
        headers: { 'x-csrf-token': 'invalid-token' }, // Gesendeter Token
        session: { csrfToken: 'valid-session-token' }, // Erwarteter Token in der Session
      });
      const res = mockResponse();
      const securedHandler = secureApi.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(mockHandler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403); // ValidationError default status, aber CSRF ist spezifischer
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'errors.invalidCsrfToken' }),
        })
      );
    });

     it('should accept valid CSRF tokens for non-safe methods (POST)', async () => {
      const req = mockRequest({
        method: 'POST',
        headers: { 'x-csrf-token': 'test-session-csrf-token' },
        session: { csrfToken: 'test-session-csrf-token' },
      });
      const res = mockResponse();
      const securedHandler = secureApi.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(mockHandler).toHaveBeenCalled();
    });


    it('should skip CSRF validation for safe methods (GET)', async () => {
      const req = mockRequest({ method: 'GET', headers: {} }); // Kein CSRF-Token gesendet
      const res = mockResponse();
      const securedHandler = secureApi.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(mockHandler).toHaveBeenCalled();
    });


    it('should call validateInput if inputValidation is true', async () => {
      const apiWithInputValidation = new SecureAPI({ inputValidation: true });
      // @ts-ignore - spyOn protected method 'validateInput' for testing purposes.
      // 'as any' is used here because 'validateInput' is protected and not directly accessible for spying without type assertion.
      const validateInputSpy = jest.spyOn(apiWithInputValidation, 'validateInput' as keyof SecureAPI);
      const req = mockRequest();
      const res = mockResponse();
      const securedHandler = apiWithInputValidation.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(validateInputSpy).toHaveBeenCalledWith(req);
      expect(mockHandler).toHaveBeenCalled();
      validateInputSpy.mockRestore();
    });


    it('should handle errors from the main handler', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Test handler error');
      mockHandler.mockRejectedValueOnce(error); // Handler wirft einen Fehler
      const securedHandler = secureApi.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Test handler error', code: 'ERR_UNKNOWN' }),
        })
      );
    });

     it('should handle FrameworkError from the main handler', async () => {
      const req = mockRequest();
      const res = mockResponse();
      // Annahme: FrameworkError(message: string, options?: { code?: string; status?: number; component?: string; cause?: Error; metadata?: any; isOperational?: boolean })
      const frameworkError = new FrameworkError('Test Framework Error', {
        code: 'ERR_TEST',
        status: 404,
        component: 'test-component',
        cause: new Error('Test Cause'), // Dummy-Error für das cause-Feld
        metadata: {},
        isOperational: true,
      });
      mockHandler.mockRejectedValueOnce(frameworkError);
      const securedHandler = secureApi.secureHandler(mockHandler);

      await securedHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test Framework Error',
            code: 'ERR_TEST',
            status: 404,
            component: 'test-component',
          }),
        })
      );
    });
  });

  describe('password management', () => {
    it('should generate secure tokens of default length', async () => {
      const token = await secureApi.generateSecureToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes * 2 hex chars/byte
    });

    it('should generate secure tokens of specified length', async () => {
      const token = await secureApi.generateSecureToken(16);
      expect(token.length).toBe(32); // 16 bytes * 2 hex chars/byte
    });

    it('should hash passwords securely and generate a salt if none provided', async () => {
      const password = 'TestPassword123!';
      const result = await secureApi.hashPassword(password);
      expect(result.hash).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.hash.length).toBe(128); // scrypt 64 bytes * 2 hex chars/byte
      expect(result.salt.length).toBe(32);  // randomBytes(16) * 2 hex chars/byte
    });

    it('should use provided salt for hashing passwords', async () => {
      const password = 'TestPassword123!';
      const salt = (await secureApi.generateSecureToken(16)); // Generate a salt
      const result = await secureApi.hashPassword(password, salt);
      expect(result.salt).toBe(salt);
    });

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const { hash, salt } = await secureApi.hashPassword(password);
      const isValid = await secureApi.verifyPassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123!';
      const { hash, salt } = await secureApi.hashPassword(password);
      const isValid = await secureApi.verifyPassword('WrongPassword!', hash, salt);
      expect(isValid).toBe(false);
    });

     it('should handle password verification with different length hashes (timing attack mitigation)', async () => {
      const password = 'TestPassword123!';
      const { salt } = await secureApi.hashPassword(password);
      const shortHash = 'short';
      const longHash = 'a'.repeat(128); // Correct length

      // Test with a hash that's too short
      let isValid = await secureApi.verifyPassword(password, shortHash, salt);
      expect(isValid).toBe(false);

      // Test with a hash that's correct length but wrong content
      const { hash: correctHashForDifferentPassword } = await secureApi.hashPassword("AnotherPassword", salt);
      isValid = await secureApi.verifyPassword(password, correctHashForDifferentPassword, salt);
      expect(isValid).toBe(false);
    });
  });
});