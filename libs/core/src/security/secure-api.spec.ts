/**
 * Tests for the SecureAPI module
 */

import { SecureAPI, isClaudeError } from './secure-api';
import { PolicyLevel } from './security.types'; // PolicyLevel hier importieren
import { ValidationError } from '../error/error-handler';
import { Request, Response } from 'express';

// Mock dependencies
jest.mock('../logging/logger', () => {
  const mockLoggerInstance = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  return {
    Logger: jest.fn().mockImplementation(() => mockLoggerInstance),
    createLogger: jest.fn().mockImplementation(() => mockLoggerInstance),
    default: mockLoggerInstance // Falls der Default-Export auch verwendet wird
  };
});

jest.mock('../config/config-manager', () => ({
  __esModule: true,
  ConfigType: {
    SECURITY: 'security'
  },
  default: {
    getConfig: jest.fn().mockReturnValue({ mcp: { allowed_servers: [] } }),
    getConfigValue: jest.fn().mockReturnValue('1.0.0')
  }
}));

jest.mock('../i18n/i18n', () => ({
  I18n: jest.fn().mockImplementation(() => ({
    translate: jest.fn().mockImplementation(key => key)
  }))
}));

describe('SecureAPI', () => {
  let secureApi: SecureAPI;

  // Mock request and response objects
  const mockRequest = (): Partial<Request> => {
    return {
      method: 'GET',
      headers: {},
      secure: true,
      socket: {
        remoteAddress: '127.0.0.1'
      } as Request['socket'], // Spezifischerer Cast für das Socket-Objekt
      body: {},
      query: {}
    };
  };

  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn();
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    secureApi = new SecureAPI();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(secureApi).toBeInstanceOf(SecureAPI);
    });

    it('should initialize with custom options', () => {
      const customApi = new SecureAPI({
        rateLimitRequests: 50,
        requireHTTPS: false,
        policyLevel: PolicyLevel.MODERATE // SecurityPolicyLevel zu PolicyLevel geändert
      });
      expect(customApi).toBeInstanceOf(SecureAPI);
    });
  });

  describe('secureHandler', () => {
    it('should apply security headers', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const handler = jest.fn().mockResolvedValue('success');
      
      const securedHandler = secureApi.secureHandler(handler);
      await securedHandler(req, res, {});
      
      expect(res.setHeader).toHaveBeenCalled();
      expect(handler).toHaveBeenCalledWith(req, res, {});
    });

    it('should reject non-HTTPS requests when required', async () => {
      const req = { ...mockRequest(), secure: false } as Request;
      const res = mockResponse() as Response;
      const handler = jest.fn().mockResolvedValue('success');
      
      const securedHandler = secureApi.secureHandler(handler);
      await securedHandler(req, res, {});
      
      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      // Create API with very low rate limit
      const lowLimitApi = new SecureAPI({
        rateLimitRequests: 1,
        rateLimitWindowMs: 60000
      });
      
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const handler = jest.fn().mockResolvedValue('success');
      
      const securedHandler = lowLimitApi.secureHandler(handler);
      
      // First request should go through
      await securedHandler(req, res, {});
      expect(handler).toHaveBeenCalledTimes(1);
      
      // Second request should be rate limited
      await securedHandler(req, res, {});
      expect(handler).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should validate CSRF tokens for non-safe methods', async () => {
      const req = { 
        ...mockRequest(), 
        method: 'POST',
        headers: { 'x-csrf-token': 'invalid-token' }
      } as Request;
      const res = mockResponse() as Response;
      const handler = jest.fn().mockResolvedValue('success');
      
      const securedHandler = secureApi.secureHandler(handler);
      await securedHandler(req, res, {});
      
      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle errors from handler', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Test error');
      const handler = jest.fn().mockRejectedValue(error);
      
      const securedHandler = secureApi.secureHandler(handler);
      await securedHandler(req, res, {});
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('validateCSRF', () => {
    it('should return true for safe methods (GET, HEAD, OPTIONS)', () => {
      const api = new SecureAPI();
      const reqGet = { method: 'GET', session: { csrfToken: 'test-token' } } as unknown as Request;
      const reqHead = { method: 'HEAD', session: { csrfToken: 'test-token' } } as unknown as Request;
      const reqOptions = { method: 'OPTIONS', session: { csrfToken: 'test-token' } } as unknown as Request;
      expect(api['validateCSRF'](reqGet)).toBe(true);
      expect(api['validateCSRF'](reqHead)).toBe(true);
      expect(api['validateCSRF'](reqOptions)).toBe(true);
    });

    it('should return true if request token matches session token (POST)', () => {
      const api = new SecureAPI();
      const req = {
        method: 'POST',
        headers: { 'x-csrf-token': 'test-token' },
        session: { csrfToken: 'test-token' }
      } as unknown as Request;
      expect(api['validateCSRF'](req)).toBe(true);
    });

    it('should return true if request token from body matches session token (POST)', () => {
      const api = new SecureAPI();
      const req = {
        method: 'POST',
        headers: {}, // Hinzugefügt
        body: { _csrf: 'test-token' },
        session: { csrfToken: 'test-token' }
      } as unknown as Request;
      expect(api['validateCSRF'](req)).toBe(true);
    });

    it('should return true if request token from query matches session token (POST)', () => {
      const api = new SecureAPI();
      const req = {
        method: 'POST',
        headers: {}, // Hinzugefügt
        query: { _csrf: 'test-token' },
        session: { csrfToken: 'test-token' }
      } as unknown as Request;
      expect(api['validateCSRF'](req)).toBe(true);
    });

    it('should return false if request token does not match session token', () => {
      const api = new SecureAPI();
      const req = {
        method: 'POST',
        headers: { 'x-csrf-token': 'wrong-token' },
        session: { csrfToken: 'test-token' }
      } as unknown as Request;
      expect(api['validateCSRF'](req)).toBe(false);
    });

    it('should return false if request token is missing', () => {
      const api = new SecureAPI();
      const req = {
        method: 'POST',
        headers: {},
        session: { csrfToken: 'test-token' }
      } as unknown as Request;
      expect(api['validateCSRF'](req)).toBe(false);
    });

    it('should return false if session token is missing', () => {
      const api = new SecureAPI();
      const req = {
        method: 'POST',
        headers: { 'x-csrf-token': 'test-token' },
        session: {} // No csrfToken in session
      } as unknown as Request;
      expect(api['validateCSRF'](req)).toBe(false);
    });
  });

  describe('createMiddleware', () => {
    it('should create an Express middleware function', () => {
      const middleware = secureApi.createMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should call next() when all checks pass', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = jest.fn();
      
      const middleware = secureApi.createMiddleware();
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should not call next() when checks fail', () => {
      const req = { ...mockRequest(), secure: false } as Request;
      const res = mockResponse() as Response;
      const next = jest.fn();
      
      const middleware = secureApi.createMiddleware();
      middleware(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalled();
    });
  });

  describe('password management', () => {
    it('should generate secure tokens', async () => {
      const token = await secureApi.generateSecureToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes as hex = 64 chars
    });

    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!';
      const result = await secureApi.hashPassword(password);
      
      expect(result.hash).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.hash.length).toBe(128); // 64 bytes as hex = 128 chars
    });

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const { hash, salt } = await secureApi.hashPassword(password);
      
      const validResult = await secureApi.verifyPassword(password, hash, salt);
      expect(validResult).toBe(true);
      
      const invalidResult = await secureApi.verifyPassword('WrongPassword', hash, salt);
      expect(invalidResult).toBe(false);
    });
  });

  describe('isClaudeError', () => {
    it('should identify Claude errors correctly', () => {
      const claudeError = new ValidationError('Test validation error');
      expect(isClaudeError(claudeError)).toBe(true);
    });

    it('should reject non-Claude errors', () => {
      const standardError = new Error('Standard error');
      expect(isClaudeError(standardError)).toBe(false);
      expect(isClaudeError(null)).toBe(false);
      expect(isClaudeError(undefined)).toBe(false);
      expect(isClaudeError({})).toBe(false);
    });
  });
});
