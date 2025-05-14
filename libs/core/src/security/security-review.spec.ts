/**
 * Tests for the SecurityReview module
 */

import { SecurityReview } from './security-review';
// Importiere die zentralen Typen
import type {
  SecurityFinding as SecurityFindingType,
  Recommendation as RecommendationType,
  ValidatorResults as ValidatorResultsType, // Wird von mockRunValidators zurückgegeben
  // SecurityVulnerability ist jetzt ein SecurityFindingType mit type: 'vulnerability'
} from './security.types';
import path from 'path';
import fs from 'fs';

// Mock dependencies
jest.mock('../logging/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}));

jest.mock('../config/config-manager', () => ({
  __esModule: true,
  ConfigType: {
    SECURITY: 'security',
    GLOBAL: 'global'
  },
  default: {
    getConfig: jest.fn().mockImplementation((configType) => {
      if (configType === 'security') {
        return {
          defaultPolicyLevel: 'strict', // Gültiger PolicyLevel-Wert
          apiAccessRules: [],
          enableAuditLog: false,
          // auditLogPath ist optional
        };
      }
      return { mcp: { allowed_servers: [] } }; // Fallback für andere ConfigTypes
    }),
    getConfigValue: jest.fn().mockReturnValue('1.0.0')
  }
}));

jest.mock('../i18n/i18n', () => ({
  I18n: jest.fn().mockImplementation(() => ({
    translate: jest.fn().mockImplementation(key => key)
  }))
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}));

describe('SecurityReview', () => {
  let securityReview: SecurityReview;
  const tempReportPath = path.join(__dirname, 'temp-security-report.json');

  // Hilfsfunktion, um Standard-Validatoren zu deregistrieren
  const unregisterStandardValidators = (reviewInstance: SecurityReview) => {
    const standardValidators = [
      'api-key-exposure', 'secure-dependencies', 'config-constraints',
      'file-permissions', 'secure-communication', 'input-validation',
      'authentication-security', 'audit-logging'
    ];
    standardValidators.forEach(name => {
      reviewInstance.unregisterValidator(name);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    securityReview = new SecurityReview({
      reportPath: tempReportPath
    });
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(securityReview).toBeInstanceOf(SecurityReview);
    });

    it('should initialize with custom options', () => {
      const customReview = new SecurityReview({
        autoFix: true,
        strictMode: false,
        reportPath: '/custom/path.json'
      });
      expect(customReview).toBeInstanceOf(SecurityReview);
    });
  });

  describe('registerValidator', () => {
    it('should register a valid validator function', () => {
      const validatorFn = async () => ({ summary: { securityScore: 100, passedValidators: 1, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 0 }, findings: [], vulnerabilities: [] });
      const result = securityReview.registerValidator('test-validator', validatorFn);
      expect(result).toBe(true);
    });

    it('should reject non-function validators', () => {
      // @ts-ignore - Testing invalid input
      const result = securityReview.registerValidator('invalid-validator', 'not-a-function');
      expect(result).toBe(false);
    });
  });

  describe('unregisterValidator', () => {
    it('should unregister an existing validator', async () => {
      const validatorFn = async () => ({ summary: { securityScore: 100, passedValidators: 1, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 0 }, findings: [], vulnerabilities: [] });
      securityReview.registerValidator('test-validator', validatorFn);
      const result = securityReview.unregisterValidator('test-validator');
      expect(result).toBe(true);
    });

    it('should return false for non-existent validator', () => {
      const result = securityReview.unregisterValidator('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('addFinding', () => {
    beforeEach(() => {
      // Deregistriere Standard-Validatoren, um addFinding isoliert zu testen
      ['api-key-exposure', 'secure-dependencies', 'config-constraints',
       'file-permissions', 'secure-communication', 'input-validation',
       'authentication-security', 'audit-logging'].forEach(name => {
        securityReview.unregisterValidator(name);
      });
    });

    it('should add a finding to the internal list', () => {
      const findingData: Partial<SecurityFindingType> = {
        title: 'Test Finding',
        description: 'A test finding',
        location: 'test.js',
        type: 'finding',
        severity: 'info',
      };
      securityReview.addFinding(findingData);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.findings.length).toBe(1);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.findings[0].title).toBe('Test Finding');
    });

    it('should generate ID for finding if not provided', () => {
      const findingData: Partial<SecurityFindingType> = {
        title: 'Test Finding No ID',
        description: 'A test finding',
        location: 'test.js',
        type: 'finding',
        severity: 'info',
      };
      securityReview.addFinding(findingData);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.findings.length).toBe(1);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.findings[0].id).toBeDefined();
      // @ts-ignore - Accessing private member for test
      expect(securityReview.findings[0].id.startsWith('finding-')).toBe(true);
    });
  });

  describe('addVulnerability', () => {
    beforeEach(() => {
      // Deregistriere Standard-Validatoren, um addVulnerability isoliert zu testen
      ['api-key-exposure', 'secure-dependencies', 'config-constraints',
       'file-permissions', 'secure-communication', 'input-validation',
       'authentication-security', 'audit-logging'].forEach(name => {
        securityReview.unregisterValidator(name);
      });
    });

    it('should add a vulnerability to the internal list', () => {
      const vulnerabilityData: Partial<SecurityFindingType> = { // Vulnerabilities sind auch SecurityFindingType
        title: 'Test Vulnerability',
        description: 'A test vulnerability',
        location: 'test.js',
        severity: 'high',
        // type: 'vulnerability' wird von addVulnerability gesetzt
      };
      securityReview.addVulnerability(vulnerabilityData);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities.length).toBe(1);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities[0].title).toBe('Test Vulnerability');
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities[0].severity).toBe('high');
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities[0].type).toBe('vulnerability');
    });

    it('should generate ID for vulnerability if not provided', () => {
      const vulnerabilityData: Partial<SecurityFindingType> = {
        title: 'Test Vulnerability No ID',
        description: 'A test vulnerability',
        location: 'test.js',
        severity: 'medium',
      };
      securityReview.addVulnerability(vulnerabilityData);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities.length).toBe(1);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities[0].id).toBeDefined();
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities[0].id.startsWith('vuln-')).toBe(true);
      // @ts-ignore - Accessing private member for test
      expect(securityReview.vulnerabilities[0].type).toBe('vulnerability');
    });
  });

  describe('runValidators', () => {
    it('should run all registered validators', async () => {
      unregisterStandardValidators(securityReview); // Standard-Validatoren entfernen
      // Register custom validators
      const finding1: SecurityFindingType = {
        id: 'finding-1',
        validator: 'validator-1',
        type: 'finding',
        title: 'Finding 1',
        description: 'Test finding 1',
        location: 'test1.js',
        severity: 'info',
        timestamp: new Date().toISOString()
      };
      const vuln1: SecurityFindingType = { // Vulnerability als SecurityFindingType
        id: 'vuln-1',
        validator: 'validator-2',
        type: 'vulnerability',
        title: 'Vulnerability 1',
        description: 'Test vulnerability 1',
        severity: 'high',
        location: 'test2.js',
        timestamp: new Date().toISOString()
      };

      const validator1 = jest.fn().mockResolvedValue({ summary: { securityScore: 100, passedValidators: 1, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 1 }, findings: [finding1], vulnerabilities: [] });
      const validator2 = jest.fn().mockResolvedValue({ summary: { securityScore: 100, passedValidators: 1, totalValidators: 1, vulnerabilitiesCount: 1, findingsCount: 0 }, findings: [], vulnerabilities: [vuln1] });
      
      securityReview.registerValidator('validator-1', validator1);
      securityReview.registerValidator('validator-2', validator2);
      
      const report: ValidatorResultsType = await securityReview.runValidators();
      
      expect(validator1).toHaveBeenCalled();
      expect(validator2).toHaveBeenCalled();
      
      // Die Standard-Validatoren sind Platzhalter und geben leere Arrays zurück.
      // Daher sollten nur die Ergebnisse der gemockten Validatoren hier erscheinen.
      expect(report.findings?.length).toBe(1);
      expect(report.findings?.[0].title).toBe('Finding 1');
      expect(report.vulnerabilities?.length).toBe(1);
      expect(report.vulnerabilities?.[0].title).toBe('Vulnerability 1');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle validator errors gracefully', async () => {
      unregisterStandardValidators(securityReview); // Standard-Validatoren entfernen
      const failingValidator = jest.fn().mockRejectedValue(new Error('Validator failed'));
      securityReview.registerValidator('failing-validator', failingValidator);
      
      const report: ValidatorResultsType = await securityReview.runValidators();
      
      expect(failingValidator).toHaveBeenCalled();
      // Da jetzt alle Standard-Validatoren entfernt wurden, sollten findings und vulnerabilities leer sein.
      expect(report.findings?.length).toBe(0);
      expect(report.vulnerabilities?.length).toBe(0);
    });

    it('should calculate security score based on findings and vulnerabilities', async () => {
      unregisterStandardValidators(securityReview); // Standard-Validatoren entfernen

      const criticalVuln: SecurityFindingType = { id: 'cv1', title: 'CV', description: 'd', location: 'l', severity: 'critical', type: 'vulnerability', validator: 'mock', timestamp: new Date().toISOString() };
      const highVuln: SecurityFindingType = { id: 'hv1', title: 'HV', description: 'd', location: 'l', severity: 'high', type: 'vulnerability', validator: 'mock', timestamp: new Date().toISOString() };
      const finding1: SecurityFindingType = { id: 'f1', title: 'F1', description: 'd', location: 'l', type: 'finding', validator: 'mock', timestamp: new Date().toISOString(), severity: 'info' };
      const finding2: SecurityFindingType = { id: 'f2', title: 'F2', description: 'd', location: 'l', type: 'finding', validator: 'mock', timestamp: new Date().toISOString(), severity: 'info' };

      securityReview.registerValidator('mock-crit-vuln', async () => ({ summary: { securityScore: 80, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 1, findingsCount: 0 }, vulnerabilities: [criticalVuln] }));
      securityReview.registerValidator('mock-high-vuln', async () => ({ summary: { securityScore: 90, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 1, findingsCount: 0 }, vulnerabilities: [highVuln] }));
      securityReview.registerValidator('mock-finding1', async () => ({ summary: { securityScore: 99, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 1 }, findings: [finding1] }));
      securityReview.registerValidator('mock-finding2', async () => ({ summary: { securityScore: 99, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 1 }, findings: [finding2] }));
      
      const report: ValidatorResultsType = await securityReview.runValidators();
      
      // Base score 100 - 20 (critical) - 10 (high) - 0.5*2 (findings) = 69
      expect(report.summary.securityScore).toBe(69);
    });

    // TODO: Add tests for individual default validators (validateNoApiKeyExposure, etc.)
    // once their implementations are complete. Currently, they are placeholders.
    // Example:
    // it('should correctly identify API key exposure by validateNoApiKeyExposure', async () => {
    //   // Setup context to trigger API key exposure
    //   const report = await securityReview.runValidators({ /* ... context ... */ });
    //   const apiKeyFinding = report.findings.find(f => f.validator === 'api-key-exposure');
    //   expect(apiKeyFinding).toBeDefined();
    // });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations based on findings and vulnerabilities', async () => {
      unregisterStandardValidators(securityReview); // Standard-Validatoren entfernen

      const apiKeyFinding: SecurityFindingType = { id: 'f1', title: 'API Key Exposure', type: 'finding', validator: 'api-key-exposure', description: 'd', location: 'l', timestamp: new Date().toISOString(), severity: 'high' };
      const depFinding: SecurityFindingType = { id: 'f2', title: 'Outdated Dependency', type: 'finding', validator: 'secure-dependencies', description: 'd', location: 'l', timestamp: new Date().toISOString(), severity: 'medium' };
      const critVuln: SecurityFindingType = { id: 'v1', title: 'Critical Vulnerability', severity: 'critical', type: 'vulnerability', validator: 'config-constraints', description: 'd', location: 'l', timestamp: new Date().toISOString(), recommendation: 'Fix now!' };

      securityReview.registerValidator('mock-api-finding', async () => ({ summary: { securityScore: 90, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 1 }, findings: [apiKeyFinding] }));
      securityReview.registerValidator('mock-dep-finding', async () => ({ summary: { securityScore: 95, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 1 }, findings: [depFinding] }));
      securityReview.registerValidator('mock-crit-vuln-rec', async () => ({ summary: { securityScore: 80, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 1, findingsCount: 0 }, vulnerabilities: [critVuln] }));
      
      const report: ValidatorResultsType = await securityReview.runValidators();
      
      expect(report.recommendations?.length).toBe(3); 
      
      const apiKeyRec = report.recommendations?.find(r => r.title === 'Secure API Keys');
      expect(apiKeyRec).toBeDefined();
      
      const depRec = report.recommendations?.find(r => r.title === 'Update Vulnerable Dependencies');
      expect(depRec).toBeDefined();
      
      const vulnRec = report.recommendations?.find(r => r.type === 'vulnerability' && r.severity === 'critical');
      expect(vulnRec).toBeDefined();
      expect(vulnRec?.title).toContain('Critical Vulnerability');
    });
  });
});
