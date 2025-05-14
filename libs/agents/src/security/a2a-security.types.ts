/**
 * A2A Security Type Definitions
 * ============================
 * 
 * Type definitions for the A2A security system, including authentication,
 * authorization, message validation, and message prioritization.
 */

import { SecurityEvent } from '../../../core/src/security/security.types';

/**
 * Agent access levels
 */
export enum AgentAccessLevel {
  PUBLIC = 'public',    // Open access to all authenticated agents
  PROTECTED = 'protected', // Access for specific agent groups
  PRIVATE = 'private',   // Access only for trusted system agents
  RESTRICTED = 'restricted' // Access requires special authorization
}

/**
 * Agent credential types for authentication
 */
export enum AgentCredentialType {
  API_KEY = 'api_key',
  JWT = 'jwt',
  MUTUAL_TLS = 'mutual_tls',
  SESSION = 'session',
  DNS = 'dns' // Domain-based DNS verification
}

/**
 * Agent authentication result
 */
export interface AuthenticationResult {
  authenticated: boolean;
  agentId?: string;
  accessLevel?: AgentAccessLevel;
  roles?: string[];
  error?: string;
}

/**
 * Agent credentials for authentication
 */
export interface AgentCredentials {
  type: AgentCredentialType;
  value: string;
  metadata?: Record<string, unknown>;
}

/**
 * Message validation rule
 */
export interface MessageValidationRule {
  field: string;
  validator: (value: unknown) => boolean;
  errorMessage: string;
}

/**
 * Message authorization rule
 */
export interface MessageAuthorizationRule {
  task: string;
  requiredAccessLevel: AgentAccessLevel;
  requiredRoles?: string[];
}

/**
 * Message priority levels
 */
export enum MessagePriority {
  CRITICAL = 5,
  HIGH = 4,
  NORMAL = 3,
  LOW = 2,
  BACKGROUND = 1
}

/**
 * Extended A2A message with security fields
 */
export interface SecureA2AMessage {
  to: string;
  from: string;
  task: string;
  params: Record<string, unknown>;
  conversationId?: string;
  priority?: MessagePriority;
  credentials?: AgentCredentials;
  signature?: string;
  timestamp?: number;
  ttl?: number; // Time-to-live in milliseconds
}

/**
 * A2A security event for audit logging
 */
export interface A2ASecurityEvent extends SecurityEvent {
  messageId?: string;
  conversationId?: string;
  agentFrom?: string;
  agentTo?: string;
  task?: string;
  action: 'authentication' | 'authorization' | 'validation' | 'prioritization' | 'routing';
  result: 'success' | 'failure';
}

/**
 * DNS Security configuration
 */
export interface DNSSecurityConfig {
  enabled: boolean;
  domain: string;
  authToken: string;
  verificationToken: string;
  challengeToken?: string;
}

/**
 * A2A security configuration
 */
export interface A2ASecurityConfig {
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableValidation: boolean;
  enablePrioritization: boolean;
  enableAuditLog: boolean;
  defaultMessageTTL: number; // Default message time-to-live in milliseconds
  maxMessageSize: number; // Maximum message size in bytes
  tokenExpirationTime: number; // Token expiration time in milliseconds
  auditLogPath?: string;
  validationRules?: Record<string, MessageValidationRule[]>;
  authorizationRules?: MessageAuthorizationRule[];
  dnsConfig?: DNSSecurityConfig; // DNS security configuration
}