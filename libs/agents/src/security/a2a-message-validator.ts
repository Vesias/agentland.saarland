/**
 * A2A Message Validator
 * ===================
 * 
 * Provides specialized validation rules for A2A messages, including
 * schema validation, content sanitization, and domain-specific rules.
 */

import { Logger } from '../../../core/src/logging/logger';
import { SecureA2AMessage, MessageValidationRule } from './a2a-security.types';

/**
 * Built-in validator types
 */
export enum ValidatorType {
  REQUIRED = 'required',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  EMAIL = 'email',
  URL = 'url',
  REGEX = 'regex',
  MAX_LENGTH = 'maxLength',
  MIN_LENGTH = 'minLength',
  MAX = 'max',
  MIN = 'min',
  ENUM = 'enum',
  CUSTOM = 'custom'
}

/**
 * Validator options for different validator types
 */
export interface ValidatorOptions {
  type: ValidatorType;
  message?: string;
  params?: unknown;
}

/**
 * Field schema for message validation
 */
export interface FieldSchema {
  validators: ValidatorOptions[];
  nested?: Record<string, FieldSchema>;
}

/**
 * Schema for message validation
 */
export interface MessageSchema {
  fields: Record<string, FieldSchema>;
}

/**
 * A2A Message Validator
 */
export class A2AMessageValidator {
  private logger: Logger;
  private taskSchemas: Map<string, MessageSchema>;
  private globalRules: MessageValidationRule[];
  
  /**
   * Create a new A2A message validator
   */
  constructor() {
    this.logger = new Logger('a2a-message-validator');
    this.taskSchemas = new Map<string, MessageSchema>();
    this.globalRules = [];
    
    // Initialize with default validation rules
    this.initializeDefaultRules();
  }
  
  /**
   * Initialize default validation rules
   * @private
   */
  private initializeDefaultRules(): void {
    // Add global rules that apply to all messages
    this.globalRules.push({
      field: 'to',
      validator: (value) => typeof value === 'string' && value.length > 0,
      errorMessage: 'Field "to" must be a non-empty string'
    });
    
    this.globalRules.push({
      field: 'from',
      validator: (value) => typeof value === 'string' && value.length > 0,
      errorMessage: 'Field "from" must be a non-empty string'
    });
    
    this.globalRules.push({
      field: 'task',
      validator: (value) => typeof value === 'string' && value.length > 0,
      errorMessage: 'Field "task" must be a non-empty string'
    });
    
    this.globalRules.push({
      field: 'params',
      validator: (value) => typeof value === 'object' && value !== null,
      errorMessage: 'Field "params" must be an object'
    });
    
    // Add sanitization rule to prevent command injection
    this.globalRules.push({
      field: 'task',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        // Prevent command injection characters
        return !/[;&|`$(){}[\]<>\\]/.test(value);
      },
      errorMessage: 'Field "task" contains invalid characters'
    });
    
    // JSON sanitization for params
    this.globalRules.push({
      field: 'params',
      validator: (value) => {
        try {
          // Check if can be safely serialized and deserialized
          const serialized = JSON.stringify(value);
          JSON.parse(serialized);
          return true;
        } catch (error) {
          return false;
        }
      },
      errorMessage: 'Field "params" contains invalid JSON'
    });
    
    // Add size limit for messages to prevent DoS
    this.globalRules.push({
      field: '',
      validator: (value) => {
        const size = Buffer.from(JSON.stringify(value)).length;
        return size <= 1048576; // 1 MB
      },
      errorMessage: 'Message exceeds maximum size of 1 MB'
    });
    
    this.logger.info('Default validation rules initialized');
  }
  
  /**
   * Add schema for a specific task
   * 
   * @param taskName - Task name
   * @param schema - Message schema
   */
  public addTaskSchema(taskName: string, schema: MessageSchema): void {
    this.taskSchemas.set(taskName, schema);
    this.logger.info(`Schema added for task: ${taskName}`);
  }
  
  /**
   * Add a global validation rule
   * 
   * @param rule - Validation rule
   */
  public addGlobalRule(rule: MessageValidationRule): void {
    this.globalRules.push(rule);
    this.logger.info(`Global validation rule added for field: ${rule.field}`);
  }
  
  /**
   * Validate a message against all applicable rules
   * 
   * @param message - A2A message to validate
   * @returns Validation result with any errors
   */
  public validate(message: SecureA2AMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Apply global rules
    for (const rule of this.globalRules) {
      try {
        const value = rule.field ? this.getNestedValue(message as unknown as Record<string, unknown>, rule.field) : message; // message is SecureA2AMessage here
        
        if (!rule.validator(value)) {
          errors.push(rule.errorMessage);
        }
      } catch (error) {
        this.logger.error(`Error applying validation rule for field ${rule.field}`, { error });
        errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Apply task-specific schema if available
    const taskSchema = this.taskSchemas.get(message.task);
    
    if (taskSchema) {
      const schemaErrors = this.validateAgainstSchema(message, taskSchema);
      errors.push(...schemaErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a message against a schema
   * 
   * @param message - A2A message
   * @param schema - Message schema
   * @returns Array of validation errors
   * @private
   */
  private validateAgainstSchema(originalMessage: unknown, schema: MessageSchema): string[] {
    const errors: string[] = [];
    
    for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
      try {
        // Sicherstellen, dass message ein Objekt ist, bevor getNestedValue aufgerufen wird
        if (typeof originalMessage !== 'object' || originalMessage === null) {
          errors.push(`Invalid message format for field ${fieldName}: expected object, got ${typeof originalMessage}`);
          continue;
        }
        const currentMessageObject = originalMessage as Record<string, unknown>;
        const value = this.getNestedValue(currentMessageObject, fieldName);
        
        // Check validators
        for (const validator of fieldSchema.validators) {
          // Pass the 'params' property of the original message as context for custom validators
          const messageParamsContext = (originalMessage as SecureA2AMessage)?.params;
          const error = this.applyValidator(value, validator, fieldName, messageParamsContext);
          
          if (error) {
            errors.push(error);
          }
        }
        
        // Check nested fields if any
        if (fieldSchema.nested && value && typeof value === 'object') {
          for (const [nestedFieldName, nestedSchema] of Object.entries(fieldSchema.nested)) {
            const currentVal = value as Record<string, unknown>; // value is an object here
            const nestedValue = currentVal[nestedFieldName];
            
            // Check validators for nested field
            for (const validator of nestedSchema.validators) {
              const messageParamsContext = (originalMessage as SecureA2AMessage)?.params;
              const error = this.applyValidator(
                nestedValue,
                validator,
                `${fieldName}.${nestedFieldName}`,
                messageParamsContext
              );
              
              if (error) {
                errors.push(error);
              }
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error validating field ${fieldName}`, { error });
        errors.push(`Validation error for field ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return errors;
  }
  
  /**
   * Apply a validator to a value
   * 
   * @param value - Value to validate
   * @param validator - Validator options
   * @param fieldName - Field name for error message
   * @returns Error message or null if valid
   * @private
   */
  private applyValidator(value: unknown, validator: ValidatorOptions, fieldName: string, messageContext?: unknown): string | null {
    const errorMessage = validator.message || `Validation failed for field ${fieldName}`;
    
    switch (validator.type) {
      case ValidatorType.REQUIRED:
        if (value === undefined || value === null || value === '') {
          return errorMessage;
        }
        break;
        
      case ValidatorType.STRING:
        if (value !== undefined && typeof value !== 'string') {
          return errorMessage;
        }
        break;
        
      case ValidatorType.NUMBER:
        if (value !== undefined && typeof value !== 'number') {
          return errorMessage;
        }
        break;
        
      case ValidatorType.BOOLEAN:
        if (value !== undefined && typeof value !== 'boolean') {
          return errorMessage;
        }
        break;
        
      case ValidatorType.OBJECT:
        if (value !== undefined && (typeof value !== 'object' || value === null || Array.isArray(value))) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.ARRAY:
        if (value !== undefined && !Array.isArray(value)) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.EMAIL:
        if (value !== undefined && (typeof value !== 'string' || !this.isValidEmail(value))) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.URL:
        if (value !== undefined && (typeof value !== 'string' || !this.isValidUrl(value))) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.REGEX:
        if (value !== undefined && (typeof value !== 'string' || !new RegExp((validator.params as { pattern: string })?.pattern).test(value))) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.MAX_LENGTH:
        if (value !== undefined && (typeof value !== 'string' || value.length > (validator.params as { max: number })?.max)) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.MIN_LENGTH:
        if (value !== undefined && (typeof value !== 'string' || value.length < (validator.params as { min: number })?.min)) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.MAX:
        if (value !== undefined && (typeof value !== 'number' || value > (validator.params as { max: number })?.max)) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.MIN:
        if (value !== undefined && (typeof value !== 'number' || value < (validator.params as { min: number })?.min)) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.ENUM:
        if (value !== undefined && !(validator.params as { values: unknown[] })?.values?.includes(value)) {
          return errorMessage;
        }
        break;
        
      case ValidatorType.CUSTOM:
        const customValidatorParams = validator.params as { validate?: (val: unknown, context?: unknown) => boolean };
        if (customValidatorParams && typeof customValidatorParams.validate === 'function' && !customValidatorParams.validate(value, messageContext)) {
          return errorMessage;
        }
        break;
    }
    
    return null;
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
    if (!path) {
      return obj;
    }
    
    const keys = path.split('.');
    let value: unknown = obj;
    
    for (const key of keys) {
      if (value == null || typeof value !== 'object') {
        return undefined;
      }
      
      value = (value as Record<string, unknown>)[key]; // value is an object here
    }
    
    return value;
  }
  
  /**
   * Check if a string is a valid email
   * 
   * @param email - Email to validate
   * @returns True if valid
   * @private
   */
  private isValidEmail(email: string): boolean {
    // Simple email validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Check if a string is a valid URL
   * 
   * @param url - URL to validate
   * @returns True if valid
   * @private
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Create common validation rules for task schemas
   * 
   * This provides helper methods to create schemas for common task patterns
   */
  
  /**
   * Create a file operation schema
   * 
   * @returns Message schema for file operations
   */
  public createFileOperationSchema(): MessageSchema {
    return {
      fields: {
        params: {
          validators: [
            { type: ValidatorType.OBJECT, message: 'params must be an object' }
          ],
          nested: {
            path: {
              validators: [
                { type: ValidatorType.REQUIRED, message: 'path is required' },
                { type: ValidatorType.STRING, message: 'path must be a string' },
                { 
                  type: ValidatorType.REGEX, 
                  message: 'path must be a valid file path', 
                  params: { pattern: '^[a-zA-Z0-9_\\-\\.\\/ ]+$' } 
                }
              ]
            },
            operation: {
              validators: [
                { type: ValidatorType.REQUIRED, message: 'operation is required' },
                { type: ValidatorType.STRING, message: 'operation must be a string' },
                { 
                  type: ValidatorType.ENUM, 
                  message: 'operation must be one of: read, write, append, delete',
                  params: { values: ['read', 'write', 'append', 'delete'] } 
                }
              ]
            },
            content: {
              validators: [
                { 
                  type: ValidatorType.CUSTOM, 
                  message: 'content must be a string for write/append operations',
                  params: { 
                    validate: (value: unknown, params: unknown) => {
                      const customParams = params as { operation?: string };
                      const operation = customParams?.operation;
                      if (operation === 'write' || operation === 'append') {
                        return typeof value === 'string';
                      }
                      return true; // Not required for other operations
                    } 
                  } 
                }
              ]
            }
          }
        }
      }
    };
  }
  
  /**
   * Create a data query schema
   * 
   * @returns Message schema for data queries
   */
  public createDataQuerySchema(): MessageSchema {
    return {
      fields: {
        params: {
          validators: [
            { type: ValidatorType.OBJECT, message: 'params must be an object' }
          ],
          nested: {
            query: {
              validators: [
                { type: ValidatorType.REQUIRED, message: 'query is required' },
                { type: ValidatorType.STRING, message: 'query must be a string' },
                { type: ValidatorType.MAX_LENGTH, message: 'query is too long', params: { max: 1000 } }
              ]
            },
            dataSource: {
              validators: [
                { type: ValidatorType.STRING, message: 'dataSource must be a string' }
              ]
            },
            limit: {
              validators: [
                { type: ValidatorType.NUMBER, message: 'limit must be a number' },
                { type: ValidatorType.MIN, message: 'limit must be positive', params: { min: 1 } },
                { type: ValidatorType.MAX, message: 'limit is too large', params: { max: 1000 } }
              ]
            }
          }
        }
      }
    };
  }
  
  /**
   * Create a notification schema
   * 
   * @returns Message schema for notifications
   */
  public createNotificationSchema(): MessageSchema {
    return {
      fields: {
        params: {
          validators: [
            { type: ValidatorType.OBJECT, message: 'params must be an object' }
          ],
          nested: {
            title: {
              validators: [
                { type: ValidatorType.REQUIRED, message: 'title is required' },
                { type: ValidatorType.STRING, message: 'title must be a string' },
                { type: ValidatorType.MAX_LENGTH, message: 'title is too long', params: { max: 100 } }
              ]
            },
            message: {
              validators: [
                { type: ValidatorType.REQUIRED, message: 'message is required' },
                { type: ValidatorType.STRING, message: 'message must be a string' },
                { type: ValidatorType.MAX_LENGTH, message: 'message is too long', params: { max: 1000 } }
              ]
            },
            level: {
              validators: [
                { type: ValidatorType.STRING, message: 'level must be a string' },
                { 
                  type: ValidatorType.ENUM, 
                  message: 'level must be one of: info, warning, error, critical',
                  params: { values: ['info', 'warning', 'error', 'critical'] } 
                }
              ]
            },
            persistent: {
              validators: [
                { type: ValidatorType.BOOLEAN, message: 'persistent must be a boolean' }
              ]
            }
          }
        }
      }
    };
  }
}

export default A2AMessageValidator;