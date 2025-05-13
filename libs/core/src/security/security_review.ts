/**
 * @file Security Review System for Claude Neural Framework
 * @description This module implements a security review and validation system to ensure
 * the framework follows best security practices and maintains compliance
 * with established security policies.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Import standardized config manager
// TODO: Sicherstellen, dass config_manager nach TypeScript migriert wurde und korrekte Typen exportiert
import configManager, { ConfigType } from '../config/config-manager'; // Korrigierter Pfad und Import

// Import standardized logger
// TODO: Sicherstellen, dass logger nach TypeScript migriert wurde und korrekte Typen exportiert
import { createLogger, Logger } from '../logging/logger'; // Annahme: logger.ts exportiert createLogger und Logger Typ

// Import internationalization
// TODO: Sicherstellen, dass i18n nach TypeScript migriert wurde und korrekte Typen exportiert
import { I18n } from '../i18n/i18n.js'; // Annahme .js, bis migriert

import {
  ValidationContext,
  SecurityFinding,
  Recommendation,
  SecurityReviewOptions,
  ValidatorFunction,
  SecurityReviewReport,
  SecurityReviewSummary,
  SecurityErrorOptions,
  // SecurityConfig, // Wird indirekt über configManager geladen
} from './security.types';

const logger: Logger = createLogger('security-review');

/**
 * Base class for security-related errors.
 */
export class SecurityError extends Error {
  public readonly code: string;
  public readonly component: string;
  public readonly status: number;
  public readonly metadata: Record<string, any>;
  public readonly timestamp: Date;

  /**
   * Creates an instance of SecurityError.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string, options: SecurityErrorOptions = {}) {
    super(message);
    this.name = 'SecurityError';
    this.code = options.code || 'ERR_SECURITY';
    this.component = 'security';
    this.status = options.status || 403; // Forbidden by default
    this.metadata = options.metadata || {};
    this.timestamp = new Date();
    Object.setPrototypeOf(this, SecurityError.prototype); // Für korrekte instanceof Überprüfung
  }
}

/**
 * Error for security policy violations.
 */
export class SecurityViolationError extends SecurityError {
  /**
   * Creates an instance of SecurityViolationError.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string, options: SecurityErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code || 'ERR_SECURITY_VIOLATION',
      status: options.status || 403, // Forbidden
    });
    this.name = 'SecurityViolationError';
    Object.setPrototypeOf(this, SecurityViolationError.prototype);
  }
}

/**
 * Error for security configuration issues.
 */
export class SecurityConfigError extends SecurityError {
  /**
   * Creates an instance of SecurityConfigError.
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string, options: SecurityErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code || 'ERR_SECURITY_CONFIG',
      status: options.status || 500, // Internal Server Error
    });
    this.name = 'SecurityConfigError';
    Object.setPrototypeOf(this, SecurityConfigError.prototype);
  }
}

/**
 * Security review system for Claude Neural Framework
 */
export class SecurityReview {
  private readonly i18n: I18n;
  // TODO: Typ für this.config anpassen, sobald SecurityConfig aus security.types.ts hier verwendet wird
  private readonly config: any; // Vorläufig any, bis configManager typisiert ist
  private readonly options: Required<SecurityReviewOptions>;
  private findings: SecurityFinding[];
  private vulnerabilities: SecurityFinding[]; // Verwenden SecurityFinding auch für Vulnerabilities mit strengerer Severity
  private securityScore: number;
  private readonly validators: Map<string, ValidatorFunction>;

  /**
   * Creates a new security review instance.
   * @param options - Configuration options for the security review.
   */
  constructor(options: SecurityReviewOptions = {}) {
    this.i18n = new I18n(); // Annahme: I18n Konstruktor benötigt keine Argumente oder hat Defaults

    try {
      // TODO: Typ für configManager.getConfig anpassen
      this.config = configManager.getConfig(ConfigType.SECURITY);

      this.options = {
        autoFix: options.autoFix !== undefined ? options.autoFix : false,
        strictMode: options.strictMode !== undefined ? options.strictMode : true,
        reportPath: options.reportPath || path.join(process.cwd(), 'security-report.json'),
        ...options, // Übernimmt alle weiteren optionalen Properties
      };

      this.findings = [];
      this.vulnerabilities = [];
      this.securityScore = 100;

      this.validators = new Map<string, ValidatorFunction>();
      this.registerDefaultValidators();

      logger.info(this.i18n.translate('security.reviewInitialized'), {
        options: this.options,
      });
    } catch (err: any) {
      logger.error(this.i18n.translate('errors.securityInitFailed'), { error: err });
      throw err; // Weiterwerfen des Originalfehlers
    }
  }

  /**
   * Registers default security validators.
   * @private
   */
  private registerDefaultValidators(): void {
    this.registerValidator('api-key-exposure', this.validateNoApiKeyExposure.bind(this));
    this.registerValidator('secure-dependencies', this.validateDependencies.bind(this));
    this.registerValidator('config-constraints', this.validateConfigConstraints.bind(this));
    this.registerValidator('file-permissions', this.validateFilePermissions.bind(this));
    this.registerValidator('secure-communication', this.validateSecureCommunication.bind(this));
    this.registerValidator('input-validation', this.validateInputHandling.bind(this));
    this.registerValidator('authentication-security', this.validateAuthentication.bind(this));
    this.registerValidator('audit-logging', this.validateAuditLogging.bind(this));

    logger.debug(this.i18n.translate('security.validatorsRegistered'), {
      count: this.validators.size,
    });
  }

  /**
   * Registers a security validator.
   * @param name - The name of the validator.
   * @param validator - The validator function.
   * @returns True if registration was successful, false otherwise.
   */
  public registerValidator(name: string, validator: ValidatorFunction): boolean {
    if (typeof validator !== 'function') {
      logger.warn(this.i18n.translate('security.invalidValidator'), { name });
      return false;
    }
    this.validators.set(name, validator);
    return true;
  }

  /**
   * Unregisters a security validator.
   * @param name - The name of the validator to unregister.
   * @returns True if unregistration was successful, false otherwise.
   */
  public unregisterValidator(name: string): boolean {
    return this.validators.delete(name);
  }

  /**
   * Runs all registered security validators.
   * @param context - Context data for validation.
   * @returns A promise that resolves with the security review report.
   */
  public async runValidators(context: ValidationContext = { targetDir: process.cwd() }): Promise<SecurityReviewReport> {
    logger.info(this.i18n.translate('security.startingValidation'), {
      validatorCount: this.validators.size,
    });

    this.findings = [];
    this.vulnerabilities = [];
    this.securityScore = 100;

    const validationPromises: Promise<{ name: string; findings: SecurityFinding[]; vulnerabilities: SecurityFinding[]; error?: string }>[] = [];

    for (const [name, validator] of this.validators.entries()) {
      logger.debug(this.i18n.translate('security.runningValidator'), { name });
      try {
        const validatorPromise = validator(context)
          .then(result => {
            logger.debug(this.i18n.translate('security.validatorCompleted'), {
              name,
              issuesFound: result.findings.length + result.vulnerabilities.length,
            });
            return { name, ...result };
          })
          .catch((error: Error) => {
            logger.error(this.i18n.translate('security.validatorFailed'), {
              name,
              error: error.message, // Nur die Nachricht loggen, nicht das ganze Objekt
            });
            return {
              name,
              error: error.message,
              findings: [],
              vulnerabilities: [],
            };
          });
        validationPromises.push(validatorPromise);
      } catch (error: any) {
        logger.error(this.i18n.translate('security.validatorError'), {
          name,
          error: error.message,
        });
         validationPromises.push(Promise.resolve({ name, error: error.message, findings: [], vulnerabilities: [] }));
      }
    }

    const results = await Promise.all(validationPromises);

    for (const result of results) {
      if (result.findings && result.findings.length > 0) {
        this.findings.push(...result.findings);
      }
      if (result.vulnerabilities && result.vulnerabilities.length > 0) {
        this.vulnerabilities.push(...result.vulnerabilities);
      }
    }

    this.calculateSecurityScore();
    const report = this.generateReport();

    if (this.options.reportPath) {
      this.saveReport(report, this.options.reportPath);
    }

    logger.info(this.i18n.translate('security.validationComplete'), {
      findingsCount: this.findings.length,
      vulnerabilitiesCount: this.vulnerabilities.length,
      securityScore: this.securityScore,
    });

    return report;
  }

  /**
   * Calculates the security score based on findings and vulnerabilities.
   * @private
   */
  private calculateSecurityScore(): void {
    let score = 100;

    for (const vulnerability of this.vulnerabilities) {
      switch (vulnerability.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
        default: // 'info' or undefined severity
          score -= 1;
      }
    }

    score -= this.findings.length * 0.5; // General findings
    this.securityScore = Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generates the security review report.
   * @returns The security report object.
   * @private
   */
  private generateReport(): SecurityReviewReport {
    const reportId = crypto.randomBytes(8).toString('hex');
    // TODO: configManager.getConfigValue typisieren
    const frameworkVersion = configManager.getConfigValue(ConfigType.GLOBAL, 'version', '1.0.0') as string;

    const summary: SecurityReviewSummary = {
      securityScore: this.securityScore,
      findingsCount: this.findings.length,
      vulnerabilitiesCount: this.vulnerabilities.length,
      passedValidators: this.countPassedValidators(),
      totalValidators: this.validators.size,
    };

    return {
      id: reportId,
      timestamp: new Date().toISOString(),
      framework: {
        name: 'Claude Neural Framework',
        version: frameworkVersion,
      },
      summary,
      findings: this.findings,
      vulnerabilities: this.vulnerabilities,
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Counts the number of validators that passed (no findings or vulnerabilities).
   * @returns The count of passed validators.
   * @private
   */
  private countPassedValidators(): number {
    const validatorNamesWithIssues = new Set<string>();
    this.findings.forEach(f => f.validator && validatorNamesWithIssues.add(f.validator));
    this.vulnerabilities.forEach(v => v.validator && validatorNamesWithIssues.add(v.validator));
    return this.validators.size - validatorNamesWithIssues.size;
  }

  /**
   * Generates recommendations based on findings and vulnerabilities.
   * @returns A list of recommendation objects.
   * @private
   */
  private generateRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const findingsByType: Record<string, SecurityFinding[]> = {};

    for (const finding of this.findings) {
      const type = finding.type || 'general';
      if (!findingsByType[type]) {
        findingsByType[type] = [];
      }
      findingsByType[type].push(finding);
    }

    for (const [type, typedFindings] of Object.entries(findingsByType)) {
      recommendations.push({
        type: type as Recommendation['type'], // Cast to ensure type compatibility
        title: this.getRecommendationTitle(type),
        description: this.getRecommendationDescription(type, typedFindings),
      });
    }

    for (const vulnerability of this.vulnerabilities) {
      if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
        recommendations.push({
          type: 'vulnerability',
          severity: vulnerability.severity,
          title: `Fix ${vulnerability.severity} severity issue: ${vulnerability.title}`,
          description: vulnerability.recommendation || `Address the ${vulnerability.severity} severity issue in ${vulnerability.location}`,
        });
      }
    }
    return recommendations;
  }

  /**
   * Gets the title for a recommendation type.
   * @param type - The recommendation type.
   * @returns The title string.
   * @private
   */
  private getRecommendationTitle(type: string): string {
    // Using i18n keys for titles would be better for localization
    switch (type) {
      case 'api-key': return 'Secure API Keys';
      case 'dependency': return 'Update Vulnerable Dependencies';
      case 'config': return 'Fix Configuration Issues';
      case 'permission': return 'Secure File Permissions';
      case 'communication': return 'Implement Secure Communication';
      case 'validation': return 'Improve Input Validation';
      case 'authentication': return 'Strengthen Authentication';
      case 'logging': return 'Enhance Audit Logging';
      default: return `Address ${type} Issues`;
    }
  }

  /**
   * Gets the description for a recommendation type.
   * @param type - The recommendation type.
   * @param findings - The list of findings for this type.
   * @returns The description string.
   * @private
   */
  private getRecommendationDescription(type: string, findings: SecurityFinding[]): string {
    const count = findings.length;
    // Using i18n keys for descriptions would be better
    switch (type) {
      case 'api-key': return `Secure ${count} potential API key exposures by using environment variables or secure storage solutions.`;
      case 'dependency': return `Update ${count} dependencies with known vulnerabilities to their latest secure versions.`;
      case 'config': return `Fix ${count} configuration issues to enhance security compliance.`;
      case 'permission': return `Address ${count} file permission issues to prevent unauthorized access.`;
      case 'communication': return `Implement secure communication protocols for ${count} identified communication channels.`;
      case 'validation': return `Improve input validation for ${count} potential entry points.`;
      case 'authentication': return `Strengthen authentication mechanisms for ${count} identified weaknesses.`;
      case 'logging': return `Enhance audit logging for ${count} sensitive operations.`;
      default: return `Address ${count} ${type} issues to improve security.`;
    }
  }

  /**
   * Saves the security report to a file.
   * @param report - The security report object.
   * @param filePath - The output file path.
   * @returns True if saving was successful, false otherwise.
   * @private
   */
  private saveReport(report: SecurityReviewReport, filePath: string): boolean {
    try {
      const reportDir = path.dirname(filePath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
      logger.info(this.i18n.translate('security.reportSaved'), { filePath });
      return true;
    } catch (error: any) {
      logger.error(this.i18n.translate('security.reportSaveError'), {
        filePath,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Adds a finding to the security review.
   * @param findingData - The details of the finding.
   */
  public addFinding(findingData: Omit<SecurityFinding, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): void {
    const finding: SecurityFinding = {
      id: findingData.id || `finding-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: findingData.timestamp || new Date().toISOString(),
      ...findingData,
    } as SecurityFinding; // Cast to ensure all properties are present
    this.findings.push(finding);
  }

  /**
   * Adds a vulnerability to the security review.
   * @param vulnerabilityData - The details of the vulnerability.
   */
  public addVulnerability(vulnerabilityData: Omit<SecurityFinding, 'id' | 'timestamp' | 'type'> & { id?: string; timestamp?: string }): void {
    const vulnerability: SecurityFinding = {
      id: vulnerabilityData.id || `vuln-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: vulnerabilityData.timestamp || new Date().toISOString(),
      type: 'vulnerability',
      ...vulnerabilityData,
    } as SecurityFinding;
    this.vulnerabilities.push(vulnerability);
  }

  // --- Default Validator Implementations (Placeholders) ---
  // These need to be fully implemented based on actual security logic.

  private async validateNoApiKeyExposure(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingApiKeyExposure'));
    const findings: SecurityFinding[] = [];
    const vulnerabilities: SecurityFinding[] = [];
    // Placeholder: Simulate finding an exposed API key
    /*
    findings.push({
      id: `api-key-${crypto.randomBytes(4).toString('hex')}`,
      validator: 'api-key-exposure',
      type: 'api-key', // This should be a valid SecurityFindingType
      title: 'Potential API Key in Code',
      description: 'Potential API key found in code. Use environment variables instead.',
      location: 'example/file/path.js:42',
      severity: 'high', // Example severity
      timestamp: new Date().toISOString(),
    });
    */
    return { findings, vulnerabilities };
  }

  private async validateDependencies(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingDependencies'));
    const findings: SecurityFinding[] = [];
    const vulnerabilities: SecurityFinding[] = [];
    // Placeholder
    return { findings, vulnerabilities };
  }

  private async validateConfigConstraints(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingConfigConstraints'));
    const findings: SecurityFinding[] = [];
    const vulnerabilities: SecurityFinding[] = [];
    // Placeholder
    /*
    vulnerabilities.push({
      id: `config-${crypto.randomBytes(4).toString('hex')}`,
      validator: 'config-constraints',
      type: 'configuration', // This should be a valid SecurityFindingType
      title: 'Insecure Configuration Setting',
      description: 'A security-critical configuration setting is set to an insecure value.',
      severity: 'high',
      location: 'core/config/security_constraints.json',
      // setting: 'network.allowed', // Custom property
      // currentValue: true, // Custom property
      // recommendedValue: false, // Custom property
      recommendation: 'Disable unrestricted network access in security constraints.',
      timestamp: new Date().toISOString(),
    });
    */
    return { findings, vulnerabilities };
  }

  private async validateFilePermissions(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingFilePermissions'));
    return { findings: [], vulnerabilities: [] };
  }

  private async validateSecureCommunication(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingSecureCommunication'));
    return { findings: [], vulnerabilities: [] };
  }

  private async validateInputHandling(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingInputValidation'));
    return { findings: [], vulnerabilities: [] };
  }

  private async validateAuthentication(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingAuthentication'));
    return { findings: [], vulnerabilities: [] };
  }

  private async validateAuditLogging(context: ValidationContext): Promise<{ findings: SecurityFinding[]; vulnerabilities: SecurityFinding[] }> {
    logger.debug(this.i18n.translate('security.checkingAuditLogging'));
    return { findings: [], vulnerabilities: [] };
  }
}