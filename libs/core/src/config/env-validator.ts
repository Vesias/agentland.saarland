import { Logger } from '../logging/logger'; // Assuming logger is in this path

const logger = new Logger('EnvValidator');

export interface EnvValidationOptions {
  throwOnMissing?: boolean;
  logLevel?: 'error' | 'warn' | 'info';
}

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  message: string;
}

/**
 * Validates the required environment variables.
 * @param requiredVars - List of the required environment variables.
 * @param options - Validation options.
 * @returns Validation result.
 * @throws {Error} If throwOnMissing is true and variables are missing.
 */
export function validateEnv(
  requiredVars: string[],
  options: EnvValidationOptions = { throwOnMissing: true, logLevel: 'error' }
): EnvValidationResult {
  const missingVars = requiredVars.filter(varName => !(varName in process.env) || process.env[varName] === undefined || process.env[varName] === '');
  
  const isValid = missingVars.length === 0;
  let message = isValid
    ? 'All required environment variables are present.'
    : `Missing or empty required environment variables: ${missingVars.join(', ')}`;

  if (!isValid) {
    if (options.logLevel === 'error') {
      logger.error(message);
    } else if (options.logLevel === 'warn') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
    
    if (options.throwOnMissing) {
      // Append a more user-friendly message for actionable feedback
      message += '\nPlease define them in your .env file or system environment.';
      throw new Error(message);
    }
  }
  
  return { isValid, missingVars, message };
}
