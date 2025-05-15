/**
 * Schema Loader and Validator for the Claude Neural Framework
 *
 * This file provides utilities to load JSON schemas and validate data against them using Ajv.
 *
 * @module core/config/schema-loader
 */

import fs from 'fs';
import path from 'path';
import Ajv, { SchemaObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../logging/logger'; // Assuming logger is in this path

// Initialize Ajv
const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Add formats like date, email, uuid, etc.

const logger = new Logger('SchemaLoader');

/**
 * Dynamically determines the project root directory.
 * @returns {string} The absolute path to the project root.
 */
function getProjectRoot(): string {
  if (__dirname.includes(path.sep + 'dist' + path.sep)) {
    return path.resolve(__dirname, '../../../../..');
  } else {
    return path.resolve(__dirname, '../../../..');
  }
}

const PROJECT_ROOT = getProjectRoot();
const SCHEMAS_DIR = path.join(PROJECT_ROOT, 'configs', 'schemas');

interface SchemaValidationResult {
  valid: boolean;
  errors: string[] | null;
}

const loadedSchemas: Map<string, ValidateFunction> = new Map();

/**
 * Loads a JSON schema from the predefined schemas directory.
 *
 * @param schemaName - The name of the schema file (e.g., "user-config.json").
 * @returns The compiled Ajv validation function.
 * @throws {Error} If the schema file cannot be found or is invalid.
 */
export function loadSchema(schemaName: string): ValidateFunction {
  if (loadedSchemas.has(schemaName)) {
    return loadedSchemas.get(schemaName)!;
  }

  const schemaPath = path.join(SCHEMAS_DIR, schemaName);
  try {
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    const schemaData = fs.readFileSync(schemaPath, 'utf8');
    const schemaObject: SchemaObject = JSON.parse(schemaData);
    
    // Compile and cache the schema
    const validate = ajv.compile(schemaObject);
    loadedSchemas.set(schemaName, validate);
    logger.info(`Schema "${schemaName}" loaded and compiled successfully.`);
    return validate;
  } catch (error: any) {
    logger.error(`Failed to load or compile schema "${schemaName}" from ${schemaPath}: ${error.message}`, { error });
    throw new Error(`Failed to load or compile schema "${schemaName}": ${error.message}`);
  }
}

/**
 * Validates data against a named JSON schema.
 *
 * @param data - The data object to validate.
 * @param schemaName - The name of the schema file (e.g., "user-config.json") to validate against.
 * @returns An object containing a boolean `valid` and an array `errors` (null if valid).
 */
export function validateSchema(data: unknown, schemaName: string): SchemaValidationResult {
  try {
    const validate = loadSchema(schemaName);
    const valid = validate(data);
    if (valid) {
      return { valid: true, errors: null };
    } else {
      return {
        valid: false,
        errors: validate.errors?.map(err => `${err.instancePath || 'instance'} ${err.message} (schema path: ${err.schemaPath})`) || ['Unknown validation error'],
      };
    }
  } catch (error: any) {
    logger.error(`Error during schema validation for "${schemaName}": ${error.message}`, { data, error });
    return {
      valid: false,
      errors: [`Validation process failed for schema "${schemaName}": ${error.message}`],
    };
  }
}

// Example usage (can be removed or kept for testing):
/*
(async () => {
  // Assume you have a schema file: configs/schemas/my-schema.json
  // And some data to validate:
  // const myData = { property: "value" };
  // const result = validateSchema(myData, 'my-schema.json');
  // if (result.valid) {
  //   logger.info("Data is valid!");
  // } else {
  //   logger.error("Data is invalid:", result.errors);
  // }
})();
*/
