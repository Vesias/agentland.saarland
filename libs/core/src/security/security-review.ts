/**
 * Security Review System for Claude Neural Framework
 * 
 * This module implements a security review and validation system to ensure
 * the framework follows best security practices and maintains compliance
 * with established security policies.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Import standardized config manager
import configManager, { ConfigType } from '../config/config-manager';

// Import standardized logger
import { Logger } from '../logging/logger';

// Import internationalization
import { I18n } from '../i18n/i18n';

// Importiere Typen aus security.types.ts
import type {
  SecurityErrorOptions as SecurityErrorOptionsType,
  SecurityReviewOptions as SecurityReviewOptionsType,
  ValidationContext as ValidationContextType,
  SecurityFinding as SecurityFindingType,
  // SecurityVulnerability wird nicht direkt importiert, da SecurityFindingType es abdeckt
  Recommendation as RecommendationType,
  ValidatorResults as ValidatorResultsType,
  SecurityReviewSummary as SecurityReviewSummaryType,
  SecurityReviewReport as SecurityReviewReportType,
} from './security.types';

// Importiere ZodSecurityConfig für die Typisierung von this.config
// und validateSecurityConfig für die Laufzeitvalidierung
import type { ZodSecurityConfig } from './schemas';
import { validateSecurityConfig } from './schemas';


/**
 * Error types for security operations
 */
export class SecurityError extends Error {
  public readonly code: string;
  public readonly component: string;
  public readonly status: number;
  public readonly metadata: Record<string, unknown>; // Geändert von any zu unknown
  public readonly timestamp: Date;

  constructor(message: string, options: SecurityErrorOptionsType = {}) { // Verwendung des importierten Typs
    super(message);
    this.name = 'SecurityError';
    this.code = options.code || 'ERR_SECURITY';
    this.component = 'security';
    this.status = options.status || 403;
    this.metadata = options.metadata || {};
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class SecurityViolationError extends SecurityError {
  constructor(message: string, options: SecurityErrorOptionsType = {}) { // Verwendung des importierten Typs
    super(message, {
      ...options,
      code: options.code || 'ERR_SECURITY_VIOLATION',
      status: options.status || 403
    });
    this.name = 'SecurityViolationError';
  }
}

export class SecurityConfigError extends SecurityError {
  constructor(message: string, options: SecurityErrorOptionsType = {}) { // Verwendung des importierten Typs
    super(message, {
      ...options,
      code: options.code || 'ERR_SECURITY_CONFIG',
      status: options.status || 500
    });
    this.name = 'SecurityConfigError';
  }
}

// Lokale Interfaces, die spezifisch für die Implementierung hier sind oder noch nicht vollständig
// mit security.types.ts harmonisiert wurden, bleiben vorerst erhalten, werden aber geprüft.
// SecurityFinding, SecurityVulnerability, SecurityRecommendation, ValidationResult, SecurityReportSummary, SecurityReport
// werden durch die importierten Typen ersetzt oder angepasst.

/**
 * Type for validator function
 */
export type ValidatorFunction = (context: ValidationContextType) => Promise<ValidatorResultsType>; // Angepasst an importierte Typen

/**
 * Security review system for Claude Neural Framework
 */
export class SecurityReview {
  private i18n: I18n;
  // TODO: Define a specific type for the security configuration
  // once its structure is clearly defined and stable.
  private config: ZodSecurityConfig; // Typisiert mit ZodSecurityConfig
  private options: SecurityReviewOptionsType; // Verwendung des importierten Typs
  private findings: SecurityFindingType[]; // Verwendung des importierten Typs
  private vulnerabilities: SecurityFindingType[]; // Vulnerabilities sind auch Findings
  private securityScore: number;
  private validators: Map<string, ValidatorFunction>;
  private logger: Logger;
  
  /**
   * Create a new security review instance
   * 
   * @param options - Configuration options
   */
  constructor(options: SecurityReviewOptionsType = {}) { // Verwendung des importierten Typs
    // Initialize logger
    this.logger = new Logger('security-review');
    
    // Initialize internationalization
    this.i18n = new I18n();
    
    // Load security configuration
    try {
      const rawConfig = configManager.getConfig(ConfigType.SECURITY);
      this.config = validateSecurityConfig(rawConfig); // Validieren und Zuweisen
      
      // Set default options
      this.options = {
        autoFix: options.autoFix !== undefined ? options.autoFix : false,
        strictMode: options.strictMode !== undefined ? options.strictMode : true,
        reportPath: options.reportPath || path.join(process.cwd(), 'security-report.json'),
        ...options
      };
      
      // Initialize review state
      this.findings = [];
      this.vulnerabilities = [];
      this.securityScore = 100;
      
      // Initialize validator registry
      this.validators = new Map<string, ValidatorFunction>();
      this.registerDefaultValidators();
      
      this.logger.info(this.i18n.translate('security.reviewInitialized'), {
        options: this.options
      });
    } catch (err) {
      this.logger.error(this.i18n.translate('errors.securityInitFailed'), { error: err });
      throw err;
    }
  }
  
  /**
   * Register default security validators
   * @private
   */
  private registerDefaultValidators(): void {
    // Register core validators
    this.registerValidator('api-key-exposure', this.validateNoApiKeyExposure.bind(this));
    this.registerValidator('secure-dependencies', this.validateDependencies.bind(this));
    this.registerValidator('config-constraints', this.validateConfigConstraints.bind(this));
    this.registerValidator('file-permissions', this.validateFilePermissions.bind(this));
    this.registerValidator('secure-communication', this.validateSecureCommunication.bind(this));
    this.registerValidator('input-validation', this.validateInputHandling.bind(this));
    this.registerValidator('authentication-security', this.validateAuthentication.bind(this));
    this.registerValidator('audit-logging', this.validateAuditLogging.bind(this));
    
    this.logger.debug(this.i18n.translate('security.validatorsRegistered'), {
      count: this.validators.size
    });
  }
  
  /**
   * Register a security validator
   * 
   * @param name - Validator name
   * @param validator - Validator function
   * @returns Success
   */
  public registerValidator(name: string, validator: ValidatorFunction): boolean {
    if (typeof validator !== 'function') {
      this.logger.warn(this.i18n.translate('security.invalidValidator'), { name });
      return false;
    }
    
    this.validators.set(name, validator);
    return true;
  }
  
  /**
   * Unregister a security validator
   * 
   * @param name - Validator name
   * @returns Success
   */
  public unregisterValidator(name: string): boolean {
    return this.validators.delete(name);
  }
  
  /**
   * Run all registered security validators
   * 
   * @param context - Context data for validation
   * @returns Validation results
   */
  public async runValidators(context: ValidationContextType = {}): Promise<ValidatorResultsType> { // Rückgabetyp angepasst
    this.logger.info(this.i18n.translate('security.startingValidation'), {
      validatorCount: this.validators.size
    });
    
    // Reset findings and score
    this.findings = [];
    this.vulnerabilities = [];
    this.securityScore = 100;
    
    // Run all validators
    const validationPromises: Promise<{name: string} & Partial<ValidatorResultsType>>[] = []; // Angepasst an importierten Typ
    
    for (const [name, validator] of this.validators.entries()) {
      this.logger.debug(this.i18n.translate('security.runningValidator'), { name });
      
      try {
        const validatorPromise = validator(context) // Direkter Aufruf, da ValidatorFunction bereits Promise<ValidatorResultsType> zurückgibt
          .then(result => {
            this.logger.debug(this.i18n.translate('security.validatorCompleted'), {
              name,
              issuesFound: (result.findings?.length || 0) + (result.vulnerabilities?.length || 0)
            });
            return { name, ...result };
          })
          .catch(error => {
            this.logger.error(this.i18n.translate('security.validatorFailed'), {
              name,
              error
            });
            // Sicherstellen, dass die Struktur von ValidatorResultsType entspricht
            return {
              name,
              summary: { // Minimales Summary für Fehlerfall
                securityScore: 0, passedValidators: 0, totalValidators: 1, vulnerabilitiesCount: 0, findingsCount: 0
              },
              findings: [],
              vulnerabilities: []
            };
          });
        validationPromises.push(validatorPromise);
      } catch (error) {
        this.logger.error(this.i18n.translate('security.validatorError'), {
          name,
          error
        });
      }
    }
    
    // Wait for all validators to complete
    const results = await Promise.all(validationPromises);
    
    // Process results
    for (const result of results) {
      if (result.findings && result.findings.length > 0) {
        this.findings.push(...result.findings);
      }
      
      if (result.vulnerabilities && result.vulnerabilities.length > 0) {
        this.vulnerabilities.push(...result.vulnerabilities);
      }
    }
    
    // Calculate security score
    this.calculateSecurityScore(); // Stellt sicher, dass this.securityScore, this.findings, this.vulnerabilities aktuell sind

    const summary: SecurityReviewSummaryType = {
      securityScore: this.securityScore,
      findingsCount: this.findings.filter(f => f.type === 'finding' || f.type === 'general').length,
      vulnerabilitiesCount: this.vulnerabilities.filter(f => f.type === 'vulnerability').length,
      passedValidators: this.countPassedValidators(),
      totalValidators: this.validators.size
    };

    const finalResults: ValidatorResultsType = {
      summary,
      findings: this.findings.filter(f => f.type === 'finding' || f.type === 'general'),
      vulnerabilities: this.vulnerabilities.filter(f => f.type === 'vulnerability'),
      recommendations: this.generateRecommendations(),
      reportPath: this.options.reportPath
    };
    
    // Save report if reportPath is provided
    if (this.options.reportPath) {
      // generateReport erzeugt SecurityReviewReportType, saveReport erwartet dies auch
      this.saveReport(this.generateFullReport(finalResults), this.options.reportPath);
    }
    
    this.logger.info(this.i18n.translate('security.validationComplete'), {
      findingsCount: finalResults.findings?.length || 0,
      vulnerabilitiesCount: finalResults.vulnerabilities?.length || 0,
      securityScore: summary.securityScore
    });
    
    return finalResults;
  }
  
  /**
   * Calculate security score based on findings and vulnerabilities
   * @private
   */
  private calculateSecurityScore(): void {
    // Base score is 100
    let score = 100;
    
    // Each vulnerability reduces score based on severity
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
        default:
          score -= 1;
      }
    }
    
    // Each finding reduces score slightly
    score -= this.findings.length * 0.5;
    
    // Ensure score is between 0 and 100
    this.securityScore = Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Generate security review report
   * 
   * @returns Security report
   * @private
   */
  private generateFullReport(results: ValidatorResultsType): SecurityReviewReportType {
    const reportId = crypto.randomBytes(8).toString('hex');
    return {
      id: reportId,
      timestamp: new Date().toISOString(),
      framework: {
        name: 'Claude Neural Framework',
        version: configManager.getConfigValue<string>(ConfigType.GLOBAL, 'version', '1.0.0') ?? '1.0.0',
      },
      summary: results.summary,
      findings: results.findings || [],
      vulnerabilities: results.vulnerabilities || [],
      recommendations: results.recommendations || [],
      // reportPath wird nicht Teil des JSON-Berichts selbst, sondern ist eine Eigenschaft von ValidatorResultsType
    };
  }

  /**
   * Count number of validators that passed (no findings or vulnerabilities)
   * 
   * @returns Count of passed validators
   * @private
   */
  private countPassedValidators(): number {
    const validatorNames = new Set([
      ...this.findings.map(finding => finding.validator),
      ...this.vulnerabilities.map(vuln => vuln.validator)
    ]);
    
    return this.validators.size - validatorNames.size;
  }
  
  /**
   * Generate recommendations based on findings and vulnerabilities
   * 
   * @returns List of recommendations
   * @private
   */
  private generateRecommendations(): RecommendationType[] {
    const recommendations: RecommendationType[] = [];

    // Group findings by type (validator name or a general category)
    const findingsByValidator = this.findings.reduce<Record<string, SecurityFindingType[]>>((groups, finding) => {
      const validatorName = finding.validator || 'general';
      if (!groups[validatorName]) {
        groups[validatorName] = [];
      }
      groups[validatorName].push(finding);
      return groups;
    }, {});

    for (const [validatorName, findings] of Object.entries(findingsByValidator)) {
      if (findings.length > 0) {
        recommendations.push({
          // type hier als 'finding' oder 'general' basierend auf validatorName oder einer Logik
          type: findings[0].type === 'vulnerability' ? 'vulnerability' : (findings[0].type || 'finding'),
          title: this.getRecommendationTitle(validatorName), // Titel basierend auf Validator
          description: this.getRecommendationDescription(validatorName, findings),
          // severity könnte hier aggregiert werden, falls relevant
        });
      }
    }
    
    // Add specific recommendations for high/critical vulnerabilities
    for (const vulnerability of this.vulnerabilities) {
      if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
        recommendations.push({
          type: 'vulnerability', // Explizit als vulnerability
          severity: vulnerability.severity,
          title: `Fix ${vulnerability.severity} severity issue: ${vulnerability.title}`,
          description: vulnerability.recommendation || `Address the ${vulnerability.severity} severity issue in ${vulnerability.location}`
        });
      }
    }
    
    // Deduplicate recommendations by title
    const uniqueRecommendations = Array.from(new Map(recommendations.map(rec => [rec.title, rec])).values());
    return uniqueRecommendations;
  }
  
  /**
   * Get title for a recommendation type
   * 
   * @param type - Recommendation type
   * @returns Title
   * @private
   */
  private getRecommendationTitle(type: string): string {
    switch (type) {
      case 'api-key-exposure':
        return 'Secure API Keys';
      case 'secure-dependencies':
        return 'Update Vulnerable Dependencies';
      case 'config-constraints':
        return 'Fix Configuration Issues';
      case 'file-permissions':
        return 'Secure File Permissions';
      case 'secure-communication':
        return 'Implement Secure Communication';
      case 'input-validation':
        return 'Improve Input Validation';
      case 'authentication-security':
        return 'Strengthen Authentication';
      case 'audit-logging':
        return 'Enhance Audit Logging';
      default:
        return `Address ${type} Issues`;
    }
  }
  
  /**
   * Get description for a recommendation type
   *
   * @param type - Recommendation type (validator name)
   * @param findings - List of findings
   * @returns Description
   * @private
   */
  private getRecommendationDescription(validatorName: string, findings: SecurityFindingType[]): string {
    // Diese Funktion könnte spezifischere Nachrichten basierend auf dem validatorName generieren
    switch (validatorName) { // validatorName direkt verwenden
      case 'api-key-exposure':
        return `Secure ${findings.length} potential API key exposures by using environment variables or secure storage solutions.`;
      case 'secure-dependencies':
        return `Update ${findings.length} dependencies with known vulnerabilities to their latest secure versions.`;
      // Weitere Fälle für andere Validatoren
      default:
        return `Address ${findings.length} ${validatorName} related issues to improve security. Review details for specific actions.`;
    }
  }
  
  /**
   * Save security report to file
   * 
   * @param report - Security report (vom Typ SecurityReviewReportType)
   * @param filePath - Output file path
   * @returns Success
   * @private
   */
  private saveReport(report: SecurityReviewReportType, filePath: string): boolean {
    try {
      const reportDir = path.dirname(filePath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Write report to file
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
      
      this.logger.info(this.i18n.translate('security.reportSaved'), { filePath });
      return true;
    } catch (error) {
      this.logger.error(this.i18n.translate('security.reportSaveError'), { 
        filePath, 
        error 
      });
      return false;
    }
  }
  
  /**
   * Add a finding to the security review
   * 
   * @param finding - Finding details
   */
  public addFinding(finding: Partial<SecurityFindingType>): void {
    const completeFinding: SecurityFindingType = {
      id: finding.id || `finding-${crypto.randomBytes(4).toString('hex')}`,
      validator: finding.validator || 'manual',
      type: finding.type || 'finding', // Standardtyp 'finding'
      title: finding.title || 'Unknown Finding',
      description: finding.description || '',
      location: finding.location || 'unknown',
      severity: finding.severity || 'info', // Standard-Severity für Findings
      timestamp: finding.timestamp || new Date().toISOString(),
      ...finding,
    };
    
    this.findings.push(completeFinding);
  }
  
  /**
   * Add a vulnerability to the security review
   * 
   * @param vulnerability - Vulnerability details
   */
  public addVulnerability(vulnerability: Partial<SecurityFindingType>): void { // Nutzt SecurityFindingType, da Vulnerabilities eine Untermenge sind
    const completeVulnerability: SecurityFindingType = {
      id: vulnerability.id || `vuln-${crypto.randomBytes(4).toString('hex')}`,
      validator: vulnerability.validator || 'manual',
      type: 'vulnerability', // Explizit als 'vulnerability'
      title: vulnerability.title || 'Unknown Vulnerability',
      description: vulnerability.description || '',
      severity: vulnerability.severity || 'medium',
      location: vulnerability.location || 'unknown',
      timestamp: vulnerability.timestamp || new Date().toISOString(),
      ...vulnerability,
    };
    
    this.vulnerabilities.push(completeVulnerability); // Wird als SecurityFindingType gespeichert
  }
  
  /**
   * Check if API keys or secrets are exposed in code or configs
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateNoApiKeyExposure(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingApiKeyExposure'));
    
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    
    // Implementation would scan files for API keys, tokens, etc.
    // This is a placeholder for the implementation
    
    // Example finding:
    findings.push({
      id: `api-key-${crypto.randomBytes(4).toString('hex')}`,
      validator: 'api-key-exposure',
      type: 'finding', // Oder 'general' je nach Definition
      title: 'Potential API Key in Code',
      description: 'Potential API key found in code. Use environment variables instead.',
      location: 'example/file/path.js:42',
      severity: 'high', // Beispiel-Severity
      timestamp: new Date().toISOString()
    });
    
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Check dependencies for known vulnerabilities
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateDependencies(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingDependencies'));
    
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    
    // Implementation would check package.json dependencies
    // against vulnerability databases like npm audit
    // This is a placeholder for the implementation
    
    // Example finding:
    // Beispiel: Eine Vulnerability wird als SecurityFindingType mit type='vulnerability' erstellt
    vulnerabilities.push({
      id: `dependency-vuln-${crypto.randomBytes(4).toString('hex')}`,
      validator: 'secure-dependencies',
      type: 'vulnerability',
      title: 'Outdated Package with CVE-XXXX',
      description: 'Using an outdated package with known vulnerabilities (CVE-XXXX).',
      location: 'package.json',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      // package: 'example-package@1.0.0', // Zusätzliche Felder können hier rein, wenn SecurityFindingType es erlaubt
      // recommendedVersion: '1.2.3'
    });
    
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Validate security constraints in configuration
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateConfigConstraints(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingConfigConstraints'));
    
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    
    // Implementation would check security settings in config files
    // This is a placeholder for the implementation
    
    // Example vulnerability:
    vulnerabilities.push({
      id: `config-${crypto.randomBytes(4).toString('hex')}`,
      validator: 'config-constraints',
      type: 'vulnerability', // Konfigurationsfehler als Vulnerability
      title: 'Insecure Configuration Setting',
      description: 'A security-critical configuration setting is set to an insecure value.',
      severity: 'high',
      location: 'core/config/security_constraints.json',
      // setting: 'network.allowed', // Zusätzliche Felder
      // currentValue: true,
      // recommendedValue: false,
      recommendation: 'Disable unrestricted network access in security constraints.',
      timestamp: new Date().toISOString()
    });
    
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Validate file permissions
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateFilePermissions(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingFilePermissions'));
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Validate secure communication protocols
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateSecureCommunication(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingSecureCommunication'));
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Validate input validation and handling
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateInputHandling(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingInputValidation'));
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Validate authentication mechanisms
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateAuthentication(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingAuthentication'));
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }
  
  /**
   * Validate audit logging
   * 
   * @param context - Validation context
   * @returns Validation results
   * @private
   */
  private async validateAuditLogging(context: ValidationContextType): Promise<ValidatorResultsType> {
    this.logger.debug(this.i18n.translate('security.checkingAuditLogging'));
    const findings: SecurityFindingType[] = [];
    const vulnerabilities: SecurityFindingType[] = [];
    return { summary: this.generateInterimSummary(findings, vulnerabilities), findings, vulnerabilities };
  }

  /**
   * Helper to generate an interim summary for individual validator results.
   */
  private generateInterimSummary(findings: SecurityFindingType[], vulnerabilities: SecurityFindingType[]): SecurityReviewSummaryType {
    return {
      securityScore: 0, // Wird später berechnet
      passedValidators: 0, // Wird später berechnet
      totalValidators: 1, // Jeder Validator ist erstmal einer
      vulnerabilitiesCount: vulnerabilities.length,
      findingsCount: findings.length,
    };
  }
}

// Export default instance
export default SecurityReview;
