/**
 * Schema Loader
 * 
 * Provides utilities for loading, validating, and managing JSON schemas
 */

import fs from 'fs';
import path from 'path';
import Ajv, { ValidateFunction } from 'ajv';
import { Logger } from '@claude-framework/core';

// Helper function to determine the project root directory
function getProjectRoot(): string {
  // Check if 'dist' is in the path, indicating a build environment
  if (__dirname.includes(path.sep + 'dist' + path.sep)) {
    // Path for build structure: e.g., .../dist/libs/shared/src/utils -> ../../../../../
    // This needs to point to the actual project root from the 'dist' location
    return path.resolve(__dirname, '../../../../..');
  } else {
    // Path for development structure: e.g., .../libs/shared/src/utils -> ../../../..
    return path.resolve(__dirname, '../../../..');
  }
}

const PROJECT_ROOT = getProjectRoot();

// Base directory for schemas, pointing to 'configs/schemas' in the project root
const SCHEMA_BASE_DIR = path.join(PROJECT_ROOT, 'configs', 'schemas');

// Define options interface
interface LoadSchemaOptions {
  validate?: boolean;
}

/**
 * Schema loader class
 */
export class SchemaLoader {
  private logger: Logger;
  
  constructor() {
    this.logger = new Logger('schema-loader');
  }
  
  /**
   * Load a schema by name
   * 
   * @param schemaName - The name of the schema (relative to schema base directory)
   * @param options - Options for loading
   * @returns The loaded schema
   */
  public loadSchema(schemaName: string, options: LoadSchemaOptions = {}): Record<string, any> {
    const { validate = true } = options;
    
    // Determine file path
    let schemaPath = `${schemaName}.json`;
    if (!path.isAbsolute(schemaPath)) {
      schemaPath = path.join(SCHEMA_BASE_DIR, schemaPath);
    }
    
    try {
      // Read schema file
      this.logger.debug(`Loading schema: ${schemaName}`);
      const schemaData = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaData);
      
      // Validate schema if requested
      if (validate) {
        if (!this.validateSchemaItself(schema)) {
          this.logger.error(`Schema ${schemaName} is not a valid JSON Schema according to its meta-schema.`);
          throw new Error(`Schema ${schemaName} is not a valid JSON Schema.`);
        }
      }
      
      return schema;
    } catch (err) {
      this.logger.error(`Failed to load schema: ${schemaName}`, { error: err });
      throw new Error(`Failed to load schema: ${schemaName} - ${(err as Error).message}`);
    }
  }
  
  /**
   * Get a list of available schemas
   * 
   * @param category - Optional category to filter by
   * @returns List of available schema names
   */
  public listSchemas(category = ''): string[] {
    const dir = category ? path.join(SCHEMA_BASE_DIR, category) : SCHEMA_BASE_DIR;
    
    try {
      const schemas: string[] = [];
      
      // Read directory recursively
      const readDir = (dir: string, prefix = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // Recursively read subdirectories
            readDir(entryPath, path.join(prefix, entry.name));
          } else if (entry.name.endsWith('.json')) {
            // Add schema file
            const schemaName = path.join(prefix, entry.name.replace(/\.json$/, ''));
            schemas.push(schemaName);
          }
        }
      };
      
      readDir(dir);
      return schemas;
    } catch (err) {
      this.logger.error(`Failed to list schemas in category: ${category}`, { error: err });
      return [];
    }
  }
  
  /**
   * Validate a schema against JSON Schema metadata
   * 
   * @param schema - The schema to validate (i.e., check if it's a valid JSON schema itself)
   * @returns Whether the schema is a valid JSON Schema.
   */
  private validateSchemaItself(schema: Record<string, any>): boolean {
    const ajv = new Ajv({ allErrors: true });
    try {
      const isValid = ajv.validateSchema(schema);
      if (!isValid) {
        this.logger.warn('The provided schema is not a valid JSON Schema:', { errors: ajv.errors });
        return false;
      }
      this.logger.debug('Schema successfully validated against its meta-schema.');
      return true;
    } catch (err) {
      // This catch block handles errors thrown by ajv.validateSchema itself,
      // for example, if the schema is so malformed ajv cannot even attempt validation.
      this.logger.error('Error during schema meta-validation with AJV.', { error: err });
      return false;
    }
  }

  /**
   * Validates data against a given JSON schema using AJV.
   *
   * @param schema - The JSON schema to validate against.
   * @param data - The data to validate.
   * @returns An object containing a boolean `valid` and an array of `errors` (if any).
   */
  public validateDataWithSchema(schema: Record<string, any>, data: unknown): { valid: boolean; errors: ValidateFunction['errors'] } { // data: any zu data: unknown geändert
    try {
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (!valid) {
        this.logger.warn('Data validation failed against the schema.', { errors: validate.errors });
        return { valid: false, errors: validate.errors };
      }
      return { valid: true, errors: null };
    } catch (err) {
      this.logger.error('Error during data validation with schema.', { error: err });
      // It's possible the schema itself is invalid for AJV
      throw new Error(`Error validating data with schema: ${(err as Error).message}`);
    }
  }
}

// Create singleton instance
const schemaLoader = new SchemaLoader();

// Export as default and named exports
export default schemaLoader;
export const loadSchema = schemaLoader.loadSchema.bind(schemaLoader);
export const listSchemas = schemaLoader.listSchemas.bind(schemaLoader);
