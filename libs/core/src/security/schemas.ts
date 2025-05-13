/**
 * Zod Schemas for Security Module
 * 
 * This file provides zod schemas for runtime validation of
 * security configurations and objects in the Claude Neural Framework.
 */

import { z } from 'zod';
import {
  PolicyLevel as PolicyLevelEnum,
} from './security.types';
import type {
  ApiAccessRule as ApiAccessRuleInterface,
  SecurityConfig as SecurityConfigInterface,
  SecurityEvent as SecurityEventInterface,
  SecurityReport as SecurityReportInterface,
  SecurityCheckOptions as SecurityCheckOptionsInterface,
  ValidationContext as ValidationContextInterface,
  SecurityReviewSummary as SecurityReviewSummaryInterface,
  SecurityFinding as SecurityFindingInterface,
  Recommendation as RecommendationInterface,
  ValidatorResults as ValidatorResultsInterface,
  SecurityReviewOptions as SecurityReviewOptionsInterface,
  SecurityReviewReport as SecurityReviewReportInterface,
  SecureApiOptions as SecureApiOptionsInterface,
} from './security.types';

/**
 * Zod schema for the {@link PolicyLevelEnum}.
 */
export const PolicyLevelSchema = z.nativeEnum(PolicyLevelEnum);

/**
 * Zod schema for the {@link ApiAccessRuleInterface}.
 * Corresponds to `ApiAccessRule` in `security.types.ts`.
 */
export const ApiAccessRuleSchema = z.object({
  resource: z.string().min(1),
  methods: z.array(z.string().min(1)).readonly(),
  allowedRoles: z.array(z.string().min(1)).readonly(),
  policyLevel: PolicyLevelSchema.optional(),
});

/**
 * Zod schema for the {@link SecurityConfigInterface}.
 * Corresponds to `SecurityConfig` in `security.types.ts`.
 */
export const SecurityConfigSchema = z.object({
  defaultPolicyLevel: PolicyLevelSchema,
  apiAccessRules: z.array(ApiAccessRuleSchema).readonly(),
  enableAuditLog: z.boolean(),
  auditLogPath: z.string().optional(),
});

/**
 * Zod schema for the {@link SecurityEventInterface}.
 * Corresponds to `SecurityEvent` in `security.types.ts`.
 */
export const SecurityEventSchema = z.object({
  timestamp: z.date(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  message: z.string().min(1),
  details: z.record(z.any()).optional(),
});

/**
 * Zod schema for the {@link SecurityReportInterface}.
 * Corresponds to `SecurityReport` in `security.types.ts`.
 */
export const SecurityReportSchema = z.object({
  generatedAt: z.date(),
  summary: z.string().min(1),
  events: z.array(SecurityEventSchema).readonly(),
  recommendations: z.array(z.string().min(1)).optional(),
});

/**
 * Zod schema for {@link SecurityCheckOptionsInterface}.
 */
export const SecurityCheckOptionsSchema = z.object({
  autofix: z.boolean().optional(),
  relaxed: z.boolean().optional(),
  output: z.string().optional(),
  dir: z.string().optional(),
  files: z.string().optional(), // Komma-separierte Liste
  exclude: z.string().optional(), // Komma-separierte Liste
  verbose: z.boolean().optional(),
});

/**
 * Zod schema for {@link ValidationContextInterface}.
 */
export const ValidationContextSchema = z.object({
  targetDir: z.string(),
  targetFiles: z.array(z.string()).readonly().optional(),
  excludePatterns: z.array(z.string()).readonly().optional(),
});

/**
 * Zod schema for {@link SecurityReviewSummaryInterface}.
 */
export const SecurityReviewSummarySchema = z.object({
  securityScore: z.number().int().min(0).max(100),
  passedValidators: z.number().int().min(0),
  totalValidators: z.number().int().min(0),
  vulnerabilitiesCount: z.number().int().min(0),
  findingsCount: z.number().int().min(0),
});

/**
 * Zod schema for {@link SecurityFindingInterface}.
 * This schema represents both vulnerabilities and general findings,
 * differentiated by the `type` and `severity` fields.
 */
export const SecurityFindingSchema = z.object({
  id: z.string().optional(), // ID might be generated runtime
  validator: z.string().optional(),
  type: z.enum(['vulnerability', 'finding']).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  recommendation: z.string().optional(),
  timestamp: z.string().datetime().optional(), // Or z.date() if preferred
});

/**
 * Zod schema for {@link RecommendationInterface}.
 */
export const RecommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['vulnerability', 'finding', 'general']),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

/**
 * Zod schema for {@link ValidatorResultsInterface}.
 * This is typically the output of `SecurityReview.runValidators`.
 */
export const ValidatorResultsSchema = z.object({
  summary: SecurityReviewSummarySchema,
  vulnerabilities: z.array(SecurityFindingSchema).readonly().optional(),
  findings: z.array(SecurityFindingSchema).readonly().optional(),
  recommendations: z.array(RecommendationSchema).readonly().optional(),
  reportPath: z.string().optional(),
});

/**
 * Zod schema for {@link SecurityReviewOptionsInterface}.
 */
export const SecurityReviewOptionsSchema = z.object({
  autoFix: z.boolean().optional(),
  strictMode: z.boolean().optional(),
  reportPath: z.string().optional(),
});

/**
 * Zod schema for {@link SecurityReviewReportInterface}.
 * This is the structure of the final JSON report.
 */
export const SecurityReviewReportFileSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(), // ISO Date String for JSON
  framework: z.object({
    name: z.string(),
    version: z.string(),
  }),
  summary: SecurityReviewSummarySchema,
  findings: z.array(SecurityFindingSchema).readonly(),
  vulnerabilities: z.array(SecurityFindingSchema).readonly(), // Vulnerabilities are also findings
  recommendations: z.array(RecommendationSchema).readonly(),
});


/**
 * Zod schema for {@link SecureApiOptionsInterface}.
 */
export const SecureApiOptionsSchema = z.object({
  rateLimitRequests: z.number().int().positive().optional(),
  rateLimitWindowMs: z.number().int().positive().optional(),
  sessionTimeoutMs: z.number().int().positive().optional(),
  requireHTTPS: z.boolean().optional(),
  csrfProtection: z.boolean().optional(),
  secureHeaders: z.boolean().optional(),
  inputValidation: z.boolean().optional(),
  // policyLevel: PolicyLevelSchema.optional(), // policyLevel is part of ApiAccessRule, not general SecureApiOptions
}).strict(); // Use strict to prevent unknown keys if these are the exact options.

// Define types from Zod schemas to be used in the application
export type ZodApiAccessRule = z.infer<typeof ApiAccessRuleSchema>;
export type ZodSecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type ZodSecurityEvent = z.infer<typeof SecurityEventSchema>;
export type ZodSecurityReport = z.infer<typeof SecurityReportSchema>;
export type ZodSecurityFinding = z.infer<typeof SecurityFindingSchema>;
export type ZodRecommendation = z.infer<typeof RecommendationSchema>;
export type ZodSecurityReviewSummary = z.infer<typeof SecurityReviewSummarySchema>;
export type ZodValidatorResults = z.infer<typeof ValidatorResultsSchema>;
export type ZodSecurityReviewReportFile = z.infer<typeof SecurityReviewReportFileSchema>;
export type ZodSecureApiOptions = z.infer<typeof SecureApiOptionsSchema>;


// Export validation functions for convenience
/**
 * Validates data against the {@link ApiAccessRuleSchema}.
 * @param data - The data to validate.
 * @returns The validated data as {@link ZodApiAccessRule}.
 * @throws ZodError if validation fails.
 */
export function validateApiAccessRule(data: unknown): ZodApiAccessRule {
  return ApiAccessRuleSchema.parse(data);
}

/**
 * Validates data against the {@link SecurityConfigSchema}.
 * @param data - The data to validate.
 * @returns The validated data as {@link ZodSecurityConfig}.
 * @throws ZodError if validation fails.
 */
export function validateSecurityConfig(data: unknown): ZodSecurityConfig {
  return SecurityConfigSchema.parse(data);
}

/**
 * Validates data against the {@link SecurityReportFileSchema}.
 * @param data - The data to validate, typically from a JSON report file.
 * @returns The validated data as {@link ZodSecurityReviewReportFile}.
 * @throws ZodError if validation fails.
 */
export function validateSecurityReviewReportFile(data: unknown): ZodSecurityReviewReportFile {
  return SecurityReviewReportFileSchema.parse(data);
}

// Export all schemas and validation functions
export default {
  PolicyLevelSchema,
  ApiAccessRuleSchema,
  SecurityConfigSchema,
  SecurityEventSchema,
  SecurityReportSchema,
  SecurityCheckOptionsSchema,
  ValidationContextSchema,
  SecurityReviewSummarySchema,
  SecurityFindingSchema,
  RecommendationSchema,
  ValidatorResultsSchema,
  SecurityReviewOptionsSchema,
  SecurityReviewReportFileSchema,
  SecureApiOptionsSchema,
  validateApiAccessRule,
  validateSecurityConfig,
  validateSecurityReviewReportFile,
};