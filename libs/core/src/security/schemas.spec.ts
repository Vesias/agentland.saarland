/**
 * Tests for the Zod schemas in the Security module
 */

import { z } from 'zod';
import {
  PolicyLevelSchema,
  ApiAccessRuleSchema,
  SecurityConfigSchema,
  SecurityEventSchema,
  SecurityReportSchema, // This is the interface-like schema from security.types.ts
  SecurityFindingSchema,
  RecommendationSchema,
  SecurityReviewSummarySchema,
  ValidatorResultsSchema,
  SecurityReviewReportFileSchema, // Use this for the file structure
  SecureApiOptionsSchema,
  validateApiAccessRule,
  validateSecurityConfig,
  validateSecurityReviewReportFile,
} from './schemas';
import { PolicyLevel } from './security.types'; // Import enum directly for values

describe('Security Schemas', () => {
  describe('PolicyLevelSchema', () => {
    it('should validate valid policy levels', () => {
      expect(PolicyLevelSchema.parse('strict')).toBe(PolicyLevel.STRICT);
      expect(PolicyLevelSchema.parse('moderate')).toBe(PolicyLevel.MODERATE);
      expect(PolicyLevelSchema.parse('open')).toBe(PolicyLevel.OPEN);
    });

    it('should reject invalid policy levels', () => {
      expect(() => PolicyLevelSchema.parse('invalid')).toThrow(z.ZodError);
      expect(() => PolicyLevelSchema.parse('')).toThrow(z.ZodError);
    });
  });

  describe('ApiAccessRuleSchema', () => {
    it('should validate valid API access rules', () => {
      const validRule = {
        resource: '/users',
        methods: ['GET', 'POST'],
        allowedRoles: ['admin', 'user'],
        policyLevel: PolicyLevel.STRICT,
      };
      expect(ApiAccessRuleSchema.parse(validRule)).toEqual(validRule);
    });

    it('should reject invalid API access rules (e.g. empty resource)', () => {
      const invalidRule = {
        resource: '', // Empty resource
        methods: ['GET'],
        allowedRoles: ['user'],
      };
      expect(() => ApiAccessRuleSchema.parse(invalidRule)).toThrow(z.ZodError);
    });

     it('should reject invalid API access rules (e.g. empty methods array)', () => {
      const invalidRule = {
        resource: '/test',
        methods: [], // Empty methods
        allowedRoles: ['user'],
      };
      expect(() => ApiAccessRuleSchema.parse(invalidRule)).toThrow(z.ZodError);
    });
  });

  describe('SecurityConfigSchema', () => {
    it('should validate valid security configurations', () => {
      const validConfig = {
        defaultPolicyLevel: PolicyLevel.MODERATE,
        apiAccessRules: [
          {
            resource: '/admin',
            methods: ['GET', 'PUT', 'DELETE'],
            allowedRoles: ['admin'],
            policyLevel: PolicyLevel.STRICT,
          },
        ],
        enableAuditLog: true,
        auditLogPath: '/var/log/audit.log',
      };
      expect(SecurityConfigSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject invalid security configurations (e.g. missing defaultPolicyLevel)', () => {
      const invalidConfig = {
        // defaultPolicyLevel: PolicyLevel.MODERATE, // Missing
        apiAccessRules: [],
        enableAuditLog: false,
      };
      expect(() => SecurityConfigSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });

  describe('SecurityEventSchema', () => {
    it('should validate valid security events', () => {
      const validEvent = {
        timestamp: new Date(),
        severity: 'info',
        message: 'User logged in',
        details: { userId: 'user123' },
      };
      expect(SecurityEventSchema.parse(validEvent)).toEqual(validEvent);
    });

    it('should reject invalid security events (e.g. invalid severity)', () => {
      const invalidEvent = {
        timestamp: new Date(),
        severity: 'super-critical', // Invalid
        message: 'Something happened',
      };
      expect(() => SecurityEventSchema.parse(invalidEvent)).toThrow(z.ZodError);
    });
  });

  describe('SecurityReportSchema (Interface-like)', () => {
    it('should validate valid security reports', () => {
      const validReport = {
        generatedAt: new Date(),
        summary: 'Security scan completed.',
        events: [
          {
            timestamp: new Date(),
            severity: 'warning',
            message: 'Weak password detected for user X.',
          },
        ],
        recommendations: ['Enforce strong password policy.'],
      };
      expect(SecurityReportSchema.parse(validReport)).toEqual(validReport);
    });
  });


  describe('SecurityFindingSchema', () => {
    it('should validate valid security findings (vulnerability type)', () => {
      const validFinding = {
        id: 'vuln-001',
        validator: 'dependency-checker',
        type: 'vulnerability',
        title: 'Outdated Library',
        description: 'The library X is outdated and has known vulnerabilities.',
        location: 'package.json',
        severity: 'high',
        recommendation: 'Update library X to version 2.0.0.',
        timestamp: new Date().toISOString(),
      };
      expect(SecurityFindingSchema.parse(validFinding)).toEqual(validFinding);
    });

     it('should validate valid security findings (finding type)', () => {
      const validFinding = {
        validator: 'config-linter',
        type: 'finding',
        title: 'Insecure Default Setting',
        description: 'Default setting for Y is insecure.',
        location: 'config.yaml',
        severity: 'medium', // Severity is required
        timestamp: new Date().toISOString(),
      };
      expect(SecurityFindingSchema.parse(validFinding)).toEqual(validFinding);
    });

    it('should reject invalid security findings (missing title)', () => {
      const invalidFinding = {
        description: 'A finding without a title.',
        location: 'some/file.js',
        severity: 'low',
      };
      expect(() => SecurityFindingSchema.parse(invalidFinding)).toThrow(z.ZodError);
    });
  });

  describe('RecommendationSchema', () => {
    it('should validate valid recommendations', () => {
      const validRecommendation = {
        title: 'Enable MFA',
        description: 'Multi-factor authentication should be enabled for all admin accounts.',
        type: 'general',
        severity: 'high',
      };
      expect(RecommendationSchema.parse(validRecommendation)).toEqual(validRecommendation);
    });
  });

  describe('SecurityReviewSummarySchema', () => {
    it('should validate valid review summaries', () => {
      const validSummary = {
        securityScore: 95,
        passedValidators: 10,
        totalValidators: 12,
        vulnerabilitiesCount: 1,
        findingsCount: 3,
      };
      expect(SecurityReviewSummarySchema.parse(validSummary)).toEqual(validSummary);
    });
  });

  describe('ValidatorResultsSchema', () => {
     it('should validate valid validator results', () => {
      const validResult = {
        summary: {
          securityScore: 90,
          passedValidators: 8,
          totalValidators: 10,
          vulnerabilitiesCount: 1,
          findingsCount: 2,
        },
        vulnerabilities: [{
            title: 'SQL Injection',
            description: 'Possible SQL injection vector.',
            location: 'userController.ts:42',
            severity: 'critical',
        }],
        findings: [{
            title: 'Missing CSRF token',
            description: 'Form X is missing CSRF protection.',
            location: 'views/formX.ejs',
            severity: 'medium',
        }],
        recommendations: [{
            title: 'Use ORM',
            description: 'Use an ORM to prevent SQL injection.',
            type: 'vulnerability',
            severity: 'critical',
        }],
        reportPath: '/reports/security-scan-123.json',
      };
      expect(ValidatorResultsSchema.parse(validResult)).toEqual(validResult);
    });
  });

  describe('SecurityReviewReportFileSchema', () => {
    it('should validate valid security review report file structures', () => {
      const validReportFile = {
        id: 'report-xyz-789',
        timestamp: new Date().toISOString(),
        framework: {
          name: 'Claude Neural Framework',
          version: '2.1.0',
        },
        summary: {
          securityScore: 75,
          passedValidators: 5,
          totalValidators: 10,
          vulnerabilitiesCount: 3,
          findingsCount: 5,
        },
        findings: [
          {
            title: 'Verbose error messages',
            description: 'Error messages might reveal sensitive information.',
            location: 'errorHandler.ts',
            severity: 'low',
            type: 'finding',
          },
        ],
        vulnerabilities: [
           {
            title: 'XSS in user profile',
            description: 'User input in profile page is not properly sanitized.',
            location: 'profile.js:101',
            severity: 'high',
            type: 'vulnerability',
          },
        ],
        recommendations: [
          {
            title: 'Sanitize all user inputs',
            description: 'Ensure all user-provided data is sanitized before rendering.',
            type: 'vulnerability',
            severity: 'high',
          },
        ],
      };
      expect(SecurityReviewReportFileSchema.parse(validReportFile)).toEqual(validReportFile);
    });
  });

  describe('SecureApiOptionsSchema', () => {
    it('should validate valid secure API options', () => {
      const validOptions = {
        rateLimitRequests: 200,
        rateLimitWindowMs: 60000,
        requireHTTPS: true,
      };
      expect(SecureApiOptionsSchema.parse(validOptions)).toEqual(validOptions);
    });

     it('should reject options with unknown keys due to .strict()', () => {
      const invalidOptions = {
        rateLimitRequests: 100,
        unknownOption: 'test', // Strict mode will reject this
      };
      expect(() => SecureApiOptionsSchema.parse(invalidOptions)).toThrow(z.ZodError);
    });
  });


  describe('validateApiAccessRule function', () => {
    it('should correctly validate using the standalone function', () => {
      const validRule = {
        resource: '/data',
        methods: ['POST'],
        allowedRoles: ['editor'],
      };
      expect(validateApiAccessRule(validRule)).toEqual(validRule);
    });
    it('should throw for invalid data using the standalone function', () => {
      expect(() => validateApiAccessRule({ resource: '/test', methods: [], allowedRoles:[] })).toThrow(z.ZodError);
    });
  });

  describe('validateSecurityConfig function', () => {
    it('should correctly validate using the standalone function', () => {
      const validConfig = {
        defaultPolicyLevel: PolicyLevel.STRICT,
        apiAccessRules: [],
        enableAuditLog: false,
      };
      expect(validateSecurityConfig(validConfig)).toEqual(validConfig);
    });
     it('should throw for invalid data using the standalone function', () => {
      expect(() => validateSecurityConfig({ apiAccessRules: [], enableAuditLog: 'yes' })).toThrow(z.ZodError);
    });
  });

  describe('validateSecurityReviewReportFile function', () => {
    it('should correctly validate using the standalone function', () => {
      const validReportFile = {
        id: 'test-report',
        timestamp: new Date().toISOString(),
        framework: { name: 'TestFW', version: '1.0' },
        summary: {
          securityScore: 100,
          passedValidators: 1,
          totalValidators: 1,
          vulnerabilitiesCount: 0,
          findingsCount: 0,
        },
        findings: [],
        vulnerabilities: [],
        recommendations: [],
      };
      expect(validateSecurityReviewReportFile(validReportFile)).toEqual(validReportFile);
    });
    it('should throw for invalid data using the standalone function', () => {
      expect(() => validateSecurityReviewReportFile({ id: 'bad-report' })).toThrow(z.ZodError);
    });
  });
});