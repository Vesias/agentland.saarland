/**
 * A2A Security Middleware
 * ======================
 * 
 * Security middleware for the A2A manager, providing authentication,
 * authorization, message validation, and message prioritization.
 */

import crypto from 'crypto';
import path from 'path';
import { Logger } from '../../../core/src/logging/logger';
import { ValidationError } from '../../../core/src/error/error-handler';
import { validateEnv } from '../../../core/src/config/env-validator';
import {
  AgentAccessLevel,
  AgentCredentialType,
  AgentCredentials, // Added import for AgentCredentials
  AuthenticationResult,
  SecureA2AMessage,
  MessagePriority,
  A2ASecurityEvent,
  A2ASecurityConfig,
  MessageValidationRule,
  MessageAuthorizationRule
} from './a2a-security.types';
import A2AMessageValidator from './a2a-message-validator';
import A2AAuthProvider from './a2a-auth-provider';

/**
 * Default security configuration
 */
const DEFAULT_SECURITY_CONFIG: A2ASecurityConfig = {
  enableAuthentication: true,
  enableAuthorization: true,
  enableValidation: true,
  enablePrioritization: true,
  enableAuditLog: true,
  defaultMessageTTL: 60000, // 1 minute
  maxMessageSize: 1048576, // 1 MB
  tokenExpirationTime: 3600000, // 1 hour
  auditLogPath: 'logs/a2a-security.log'
};

/**
 * A2A Security Middleware
 */
export class A2ASecurityMiddleware {
  private logger: Logger;
  private config: A2ASecurityConfig;
  private authProvider: A2AAuthProvider;
  private validationRules: Map<string, MessageValidationRule[]>;
  private authorizationRules: MessageAuthorizationRule[];
  private securityEvents: A2ASecurityEvent[];
  private lastAuditFlush: number;
  private messageValidator: A2AMessageValidator;
  
  /**
   * Create a new A2A security middleware
   * 
   * @param config - Security configuration
   */
  constructor(config: Partial<A2ASecurityConfig> = {}) {
    this.logger = new Logger('a2a-security');
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
    this.validationRules = new Map();
    this.authorizationRules = [];
    this.securityEvents = [];
    this.lastAuditFlush = Date.now();

    // Validate required environment variables for A2A security
    // This will throw an error and halt initialization if A2A_JWT_SECRET is not set.
    validateEnv(['A2A_JWT_SECRET']);
    
    // Initialize authentication provider
    this.authProvider = new A2AAuthProvider({
      apiKeysFile: process.env.API_KEYS_PATH || (this.config.auditLogPath ? path.join(path.dirname(this.config.auditLogPath), 'api-keys.json') : undefined),
      jwt: {
        secretKey: process.env.A2A_JWT_SECRET as string, // Already validated by validateEnv
        issuer: process.env.A2A_JWT_ISSUER || 'a2a-manager',
        audience: process.env.A2A_JWT_AUDIENCE || 'a2a-agents',
        expiresIn: process.env.A2A_JWT_EXPIRES_IN || '1d'
      }
    });
    
    // Initialize message validator
    this.messageValidator = new A2AMessageValidator();
    
    // Initialize validation rules
    if (this.config.validationRules) {
      Object.entries(this.config.validationRules).forEach(([task, rules]) => {
        this.validationRules.set(task, rules);
      });
    }
    
    // Initialize authorization rules
    if (this.config.authorizationRules) {
      this.authorizationRules = this.config.authorizationRules;
    }
    
    // Initialize standard task schemas
    this.initializeStandardTaskSchemas();
    
    this.logger.info('A2A security middleware initialized', {
      enableAuthentication: this.config.enableAuthentication,
      enableAuthorization: this.config.enableAuthorization,
      enableValidation: this.config.enableValidation,
      enablePrioritization: this.config.enablePrioritization
    });
    
    // Asynchronously initialize authentication provider
    this.authProvider.initialize().catch(error => {
      this.logger.error('Failed to initialize authentication provider', { error });
    });
  }
  
  /**
   * Initialize standard task schemas for common operations
   * @private
   */
  private initializeStandardTaskSchemas(): void {
    // Add file operation schema
    this.messageValidator.addTaskSchema('file.read', this.messageValidator.createFileOperationSchema());
    this.messageValidator.addTaskSchema('file.write', this.messageValidator.createFileOperationSchema());
    this.messageValidator.addTaskSchema('file.append', this.messageValidator.createFileOperationSchema());
    this.messageValidator.addTaskSchema('file.delete', this.messageValidator.createFileOperationSchema());
    
    // Add data query schema
    this.messageValidator.addTaskSchema('data.query', this.messageValidator.createDataQuerySchema());
    this.messageValidator.addTaskSchema('data.search', this.messageValidator.createDataQuerySchema());
    
    // Add notification schema
    this.messageValidator.addTaskSchema('notification.send', this.messageValidator.createNotificationSchema());
  }
  
  /**
   * Register an agent API key
   * 
   * @param agentId - Agent identifier
   * @param apiKey - API key (optional, will be generated if not provided)
   * @param accessLevel - Access level
   * @param roles - Agent roles
   * @param expiresInDays - Number of days until expiration (0 for no expiration)
   * @returns The API key (existing or newly generated)
   */
  public async registerAgentApiKey(
    agentId: string, 
    apiKey?: string, 
    accessLevel: AgentAccessLevel = AgentAccessLevel.PUBLIC,
    roles: string[] = [],
    expiresInDays: number = 0
  ): Promise<string> {
    if (apiKey) {
      // Use provided API key
      await this.authProvider.registerApiKey(agentId, accessLevel, roles, expiresInDays);
      this.logger.info(`Registered provided API key for agent: ${agentId}`, { accessLevel, roles });
      return apiKey;
    } else {
      // Generate new API key
      const newApiKey = await this.authProvider.registerApiKey(agentId, accessLevel, roles, expiresInDays);
      this.logger.info(`Generated and registered API key for agent: ${agentId}`, { accessLevel, roles });
      return newApiKey;
    }
  }
  
  /**
   * Add validation rules for a task
   * 
   * @param task - Task name
   * @param rules - Validation rules
   */
  public addValidationRules(task: string, rules: MessageValidationRule[]): void {
    const existingRules = this.validationRules.get(task) || [];
    this.validationRules.set(task, [...existingRules, ...rules]);
    this.logger.info(`Added validation rules for task: ${task}`, { ruleCount: rules.length });
  }
  
  /**
   * Add an authorization rule
   * 
   * @param rule - Authorization rule
   */
  public addAuthorizationRule(rule: MessageAuthorizationRule): void {
    this.authorizationRules.push(rule);
    this.logger.info(`Added authorization rule for task: ${rule.task}`, { 
      requiredAccessLevel: rule.requiredAccessLevel,
      requiredRoles: rule.requiredRoles
    });
  }
  
  /**
   * Process an A2A message through the security middleware
   * 
   * @param message - A2A message
   * @returns Processed message or null if rejected
   */
  public async processMessage(message: SecureA2AMessage): Promise<SecureA2AMessage | null> {
    try {
      // Check message TTL
      if (!this.checkMessageTTL(message)) {
        throw new ValidationError('Message expired (TTL exceeded)');
      }
      
      // Check message size
      if (!this.checkMessageSize(message)) {
        throw new ValidationError('Message exceeds maximum size limit');
      }
      
      // Authenticate agent if enabled
      let authResult: AuthenticationResult = { authenticated: !this.config.enableAuthentication };
      if (this.config.enableAuthentication) {
        authResult = await this.authenticateAgent(message);
        if (!authResult.authenticated) {
          throw new ValidationError(`Authentication failed: ${authResult.error}`);
        }
        
        // Set authenticated agent ID if different from the message's 'from'
        if (authResult.agentId && authResult.agentId !== message.from) {
          this.logger.warn(`Message sender mismatch. From: ${message.from}, Authenticated: ${authResult.agentId}`);
          message.from = authResult.agentId; // Override with authenticated identity
        }
      }
      
      // Validate message if enabled
      if (this.config.enableValidation && !this.validateMessage(message)) {
        throw new ValidationError('Message validation failed');
      }
      
      // Authorize message if enabled
      if (this.config.enableAuthorization && 
          !this.authorizeMessage(message, authResult.accessLevel || AgentAccessLevel.PUBLIC, authResult.roles || [])) {
        throw new ValidationError('Message authorization failed');
      }
      
      // Prioritize message if enabled
      if (this.config.enablePrioritization) {
        message = this.prioritizeMessage(message);
      }
      
      // Log successful processing
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'info',
        message: 'Message processed successfully',
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'routing',
        result: 'success'
      });
      
      return message;
    } catch (error) {
      // Log security error
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'warning',
        message: error instanceof Error ? error.message : 'Unknown error',
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'routing',
        result: 'failure',
        details: { error }
      });
      
      return null;
    } finally {
      // Flush audit log if needed
      this.flushAuditLogIfNeeded();
    }
  }
  
  /**
   * Check if a message has expired based on TTL
   * 
   * @param message - A2A message
   * @returns True if message is still valid
   * @private
   */
  private checkMessageTTL(message: SecureA2AMessage): boolean {
    // If no timestamp, add current timestamp
    if (!message.timestamp) {
      message.timestamp = Date.now();
      return true;
    }
    
    // Check if message has expired
    const ttl = message.ttl || this.config.defaultMessageTTL;
    const age = Date.now() - message.timestamp;
    
    return age <= ttl;
  }
  
  /**
   * Check if a message size is within limits
   * 
   * @param message - A2A message
   * @returns True if message size is within limits
   * @private
   */
  private checkMessageSize(message: SecureA2AMessage): boolean {
    const messageSize = Buffer.from(JSON.stringify(message)).length;
    return messageSize <= this.config.maxMessageSize;
  }
  
  /**
   * Authenticate an agent based on credentials
   * 
   * @param message - A2A message with credentials
   * @returns Authentication result
   * @private
   */
  private async authenticateAgent(message: SecureA2AMessage): Promise<AuthenticationResult> { // Already async, good.
    // Check if credentials are provided
    if (!message.credentials) {
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'warning',
        message: 'No credentials provided',
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'authentication',
        result: 'failure'
      });
      
      return { 
        authenticated: false, 
        error: 'No credentials provided' 
      };
    }
    
    // Use the authentication provider
    // Assuming authenticate might be async based on other methods in A2AAuthProvider
    // If A2AAuthProvider.authenticate is synchronous, this await is not needed
    // but if it can be async, this makes it robust.
    // However, the error suggests it's returning a Promise OR the direct result.
    // Let's assume it's always a Promise for consistency or that the type implies it *can* be.
    // The error "Property 'authenticated' does not exist on type 'AuthenticationResult | Promise<AuthenticationResult>'"
    // means authResult can be a Promise. We must await it.
    const resolvedAuthResult = await this.authProvider.authenticate(message); 
    const authResult: AuthenticationResult = resolvedAuthResult; // Explicitly type after await
    
    // Log the authentication result
    if (authResult.authenticated) {
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'info',
        message: `Successfully authenticated agent: ${authResult.agentId}`,
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'authentication',
        result: 'success'
      });
    } else {
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'warning',
        message: `Authentication failed: ${authResult.error}`,
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'authentication',
        result: 'failure'
      });
    }
    
    return authResult;
  }
  
  /**
   * Validate a message against validation rules
   * 
   * @param message - A2A message
   * @returns True if validation passes
   * @private
   */
  private validateMessage(message: SecureA2AMessage): boolean {
    // Check required fields
    if (!message.to || !message.from || !message.task) {
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'warning',
        message: 'Message missing required fields',
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'validation',
        result: 'failure',
        details: { 
          missingFields: {
            to: !message.to,
            from: !message.from,
            task: !message.task
          }
        }
      });
      
      return false;
    }
    
    // Use the message validator
    const validationResult = this.messageValidator.validate(message);
    
    if (!validationResult.valid) {
      const errorMessage = validationResult.errors.join('; ');
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'warning',
        message: `Validation failed: ${errorMessage}`,
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'validation',
        result: 'failure',
        details: { errors: validationResult.errors }
      });
      
      return false;
    }
    
    // If needed, apply additional custom rules specific to tasks
    const rules = this.validationRules.get(message.task) || [];
    
    // Validate against each rule
    for (const rule of rules) {
      try {
        const value = this.getNestedValue(message as unknown as Record<string, unknown>, rule.field);
        
        if (!rule.validator(value)) {
          this.logSecurityEvent({
            timestamp: new Date(),
            severity: 'warning',
            message: `Validation failed: ${rule.errorMessage}`,
            messageId: crypto.randomBytes(8).toString('hex'),
            conversationId: message.conversationId,
            agentFrom: message.from,
            agentTo: message.to,
            task: message.task,
            action: 'validation',
            result: 'failure',
            details: { 
              field: rule.field, 
              value, 
              errorMessage: rule.errorMessage 
            }
          });
          
          return false;
        }
      } catch (error) {
        this.logSecurityEvent({
          timestamp: new Date(),
          severity: 'warning',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          messageId: crypto.randomBytes(8).toString('hex'),
          conversationId: message.conversationId,
          agentFrom: message.from,
          agentTo: message.to,
          task: message.task,
          action: 'validation',
          result: 'failure',
          details: { field: rule.field, error }
        });
        
        return false;
      }
    }
    
    // All rules passed
    return true;
  }
  
  /**
   * Authorize a message based on access level and roles
   * 
   * @param message - A2A message
   * @param accessLevel - Agent access level
   * @param roles - Agent roles
   * @returns True if authorization passes
   * @private
   */
  private authorizeMessage(message: SecureA2AMessage, accessLevel: AgentAccessLevel, roles: string[]): boolean {
    // Find authorization rule for the task
    const rule = this.authorizationRules.find(r => r.task === message.task);
    
    // If no rule, allow access
    if (!rule) {
      return true;
    }
    
    // Check access level
    if (this.getAccessLevelValue(accessLevel) < this.getAccessLevelValue(rule.requiredAccessLevel)) {
      this.logSecurityEvent({
        timestamp: new Date(),
        severity: 'warning',
        message: `Insufficient access level: ${accessLevel}, required: ${rule.requiredAccessLevel}`,
        messageId: crypto.randomBytes(8).toString('hex'),
        conversationId: message.conversationId,
        agentFrom: message.from,
        agentTo: message.to,
        task: message.task,
        action: 'authorization',
        result: 'failure',
        details: { 
          agentAccessLevel: accessLevel, 
          requiredAccessLevel: rule.requiredAccessLevel 
        }
      });
      
      return false;
    }
    
    // Check required roles if any
    if (rule.requiredRoles && rule.requiredRoles.length > 0) {
      const hasRequiredRole = rule.requiredRoles.some(role => roles.includes(role));
      
      if (!hasRequiredRole) {
        this.logSecurityEvent({
          timestamp: new Date(),
          severity: 'warning',
          message: `Missing required role. Available roles: ${roles.join(', ')}, required: ${rule.requiredRoles.join(', ')}`,
          messageId: crypto.randomBytes(8).toString('hex'),
          conversationId: message.conversationId,
          agentFrom: message.from,
          agentTo: message.to,
          task: message.task,
          action: 'authorization',
          result: 'failure',
          details: { 
            agentRoles: roles, 
            requiredRoles: rule.requiredRoles 
          }
        });
        
        return false;
      }
    }
    
    // Authorization passed
    this.logSecurityEvent({
      timestamp: new Date(),
      severity: 'info',
      message: 'Message authorized',
      messageId: crypto.randomBytes(8).toString('hex'),
      conversationId: message.conversationId,
      agentFrom: message.from,
      agentTo: message.to,
      task: message.task,
      action: 'authorization',
      result: 'success'
    });
    
    return true;
  }
  
  /**
   * Prioritize a message based on task and sender
   * 
   * @param message - A2A message
   * @returns Prioritized message
   * @private
   */
  private prioritizeMessage(message: SecureA2AMessage): SecureA2AMessage {
    // If priority is already set, use it
    if (message.priority !== undefined) {
      return message;
    }
    
    // Default priority is NORMAL
    let priority: MessagePriority = MessagePriority.NORMAL;
    
    // Prioritize based on task (example rules, should be customized)
    if (message.task.includes('emergency') || message.task.includes('critical')) {
      priority = MessagePriority.CRITICAL;
    } else if (message.task.includes('high') || message.task.startsWith('system.')) {
      priority = MessagePriority.HIGH;
    } else if (message.task.includes('background') || message.task.includes('report')) {
      priority = MessagePriority.BACKGROUND;
    }
    
    // Set priority
    message.priority = priority;
    
    this.logSecurityEvent({
      timestamp: new Date(),
      severity: 'info',
      message: `Message prioritized: ${MessagePriority[priority]}`,
      messageId: crypto.randomBytes(8).toString('hex'),
      conversationId: message.conversationId,
      agentFrom: message.from,
      agentTo: message.to,
      task: message.task,
      action: 'prioritization',
      result: 'success',
      details: { priority }
    });
    
    return message;
  }
  
  /**
   * Log a security event
   * 
   * @param event - Security event
   * @private
   */
  private logSecurityEvent(event: A2ASecurityEvent): void {
    if (!this.config.enableAuditLog) {
      return;
    }
    
    // Store event in memory
    this.securityEvents.push(event);
    
    // Log to console as well
    if (event.severity === 'critical' || event.severity === 'error') {
      this.logger.error(event.message, event);
    } else if (event.severity === 'warning') {
      this.logger.warn(event.message, event);
    } else {
      this.logger.debug(event.message, event);
    }
  }
  
  /**
   * Flush audit log if needed
   * 
   * @private
   */
  private flushAuditLogIfNeeded(): void {
    // Check if we should flush (every minute or 100 events)
    const shouldFlush = 
      Date.now() - this.lastAuditFlush > 60000 || // 1 minute
      this.securityEvents.length > 100;
    
    if (shouldFlush) {
      this.flushAuditLog();
    }
  }
  
  /**
   * Flush audit log to file
   * 
   * @private
   */
  private flushAuditLog(): void {
    if (!this.config.enableAuditLog || this.securityEvents.length === 0) {
      return;
    }
    
    // In a real implementation, this would write to a file or database
    // For this example, we just log to console
    this.logger.info(`Flushed ${this.securityEvents.length} security events`);
    
    // Reset events and update last flush timestamp
    this.securityEvents = [];
    this.lastAuditFlush = Date.now();
  }
  
  /**
   * Generate JWT token for an agent
   * 
   * @param agentId - Agent identifier
   * @param accessLevel - Access level
   * @param roles - Agent roles
   * @param expiresIn - Expiration time (e.g., '1h', '7d')
   * @returns JWT token
   */
  public generateJwtToken(
    agentId: string,
    accessLevel: AgentAccessLevel = AgentAccessLevel.PUBLIC,
    roles: string[] = [],
    expiresIn?: string
  ): string {
    return this.authProvider.generateJwtToken(agentId, accessLevel, roles, expiresIn);
  }
  
  /**
   * Create credentials for a message
   * 
   * @param agentId - Agent identifier
   * @param credentialType - Credential type
   * @param credentialValue - Credential value (optional)
   * @returns Agent credentials
   */
  public createCredentials(
    agentId: string,
    credentialType: AgentCredentialType,
    credentialValue?: string
  ): AgentCredentials {
    return this.authProvider.createCredentials(agentId, credentialType, credentialValue);
  }
  
  /**
   * Get a numeric value for an access level for comparison
   * 
   * @param level - Access level
   * @returns Numeric value
   * @private
   */
  private getAccessLevelValue(level: AgentAccessLevel): number {
    switch (level) {
      case AgentAccessLevel.PUBLIC:
        return 0;
      case AgentAccessLevel.PROTECTED:
        return 1;
      case AgentAccessLevel.PRIVATE:
        return 2;
      case AgentAccessLevel.RESTRICTED:
        return 3;
      default:
        return 0;
    }
  }
  
  /**
   * Get a nested value from an object by dot notation
   * 
   * @param obj - Object to search
   * @param path - Path to value using dot notation
   * @returns Value at path
   * @private
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let value: unknown = obj;
    
    for (const key of keys) {
      if (value == null || typeof value !== 'object') {
        return undefined;
      }
      
      value = (value as Record<string, unknown>)[key];
    }
    
    return value;
  }
}

export default A2ASecurityMiddleware;
