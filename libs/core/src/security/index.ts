/**
 * Security Module for Claude Neural Framework
 * 
 * This module provides security-related functionality including:
 * - Security review and validation
 * - Security check CLI tool
 * - Secure API implementation
 */

// Export security review classes and functions
export {
  SecurityReview,
  SecurityError, // Diese sind in security-review.ts definiert
  SecurityViolationError,
  SecurityConfigError,
} from './security-review';

// Export secure API class, function and related types (PasswordHashResult ist in secure-api.ts definiert)
export {
  SecureAPI,
  isClaudeError, // ist in secure-api.ts definiert
  type PasswordHashResult, // ist in secure-api.ts definiert
} from './secure-api';

// Export all types from security.types.ts as they are the central source of truth
export type {
  ApiAccessRule,
  SecurityConfig,
  SecurityEvent,
  SecurityReport as SecurityReportTypeAlias, // Alias, da SecurityReport auch in security-review.ts lokal war
  SecurityCheckOptions,
  ValidationContext,
  SecurityReviewSummary,
  SecurityFinding,
  Recommendation,
  ValidatorResults,
  SecurityReviewOptions,
  ValidatorFunction, // Obwohl dieser Typ in security-review.ts verwendet wird, ist er in security.types.ts definiert
  SecurityReviewReport,
  SecurityErrorOptions,
  SecureApiOptions,
  MockRequest,
  MockResponse,
  FormattedErrorResponse,
  PolicyLevel, // Ersetzt SecurityPolicyLevel
} from './security.types';

// Default export for easy importing
import { SecurityReview as DefaultSecurityReview } from './security-review'; // Alias um Kollision zu vermeiden
export default DefaultSecurityReview;
