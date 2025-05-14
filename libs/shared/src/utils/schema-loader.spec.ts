import { SchemaLoader } from './schema-loader';
import fs from 'fs';

// Mock fs.readFileSync
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('SchemaLoader', () => {
  let schemaLoader: SchemaLoader;
  // @ts-ignore
  let consoleWarnSpy: jest.SpyInstance;
  // @ts-ignore
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    schemaLoader = new SchemaLoader();
    // Spy on console.warn and console.error to check logger outputs if necessary
    consoleWarnSpy = jest.spyOn(schemaLoader['logger'], 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(schemaLoader['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore original console methods
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    mockedFs.readFileSync.mockReset();
  });

  describe('validateDataWithSchema', () => {
    const sampleSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 3 },
        age: { type: 'integer', minimum: 18 },
        email: { type: 'string', format: 'email' },
        isActive: { type: 'boolean' },
      },
      required: ['name', 'age', 'isActive'],
      additionalProperties: false,
    };

    it('should validate correct data against the schema', () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john.doe@example.com',
        isActive: true,
      };
      const result = schemaLoader.validateDataWithSchema(sampleSchema, validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('should invalidate data with a missing required field', () => {
      const invalidData = {
        // name is missing
        age: 30,
        email: 'john.doe@example.com',
        isActive: true,
      };
      const result = schemaLoader.validateDataWithSchema(sampleSchema, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'required',
            params: { missingProperty: 'name' },
          }),
        ])
      );
    });

    it('should invalidate data with an incorrect type (age as string)', () => {
      const invalidData = {
        name: 'Jane Doe',
        age: '30', // Incorrect type
        email: 'jane.doe@example.com',
        isActive: true,
      };
      const result = schemaLoader.validateDataWithSchema(sampleSchema, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            instancePath: '/age',
            keyword: 'type',
            params: { type: 'integer' },
          }),
        ])
      );
    });

    it('should invalidate data with a field not meeting minimum constraint (age < 18)', () => {
      const invalidData = {
        name: 'Young Person',
        age: 17, // Fails minimum constraint
        isActive: true,
      };
      const result = schemaLoader.validateDataWithSchema(sampleSchema, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            instancePath: '/age',
            keyword: 'minimum',
            params: { limit: 18 },
          }),
        ])
      );
    });

    it('should invalidate data with a string not meeting minLength constraint', () => {
        const invalidData = {
          name: 'Jo', // Fails minLength constraint
          age: 25,
          isActive: true,
        };
        const result = schemaLoader.validateDataWithSchema(sampleSchema, invalidData);
        expect(result.valid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              instancePath: '/name',
              keyword: 'minLength',
              params: { limit: 3 },
            }),
          ])
        );
      });

    it('should invalidate data with an invalid email format', () => {
      const invalidData = {
        name: 'Test User',
        age: 25,
        email: 'not-an-email', // Invalid format
        isActive: false,
      };
      const result = schemaLoader.validateDataWithSchema(sampleSchema, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            instancePath: '/email',
            keyword: 'format',
            params: { format: 'email' },
          }),
        ])
      );
    });

    it('should invalidate data with additional properties when additionalProperties is false', () => {
      const invalidData = {
        name: 'Extra Prop',
        age: 40,
        isActive: true,
        extraField: 'this should not be here',
      };
      const result = schemaLoader.validateDataWithSchema(sampleSchema, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'additionalProperties',
            params: { additionalProperty: 'extraField' },
          }),
        ])
      );
    });

    it('should throw an error if the schema itself is invalid for AJV', () => {
      const invalidSchema: any = {
        type: 'object',
        properties: {
          name: { type: 'invalid-type-for-ajv' }, // AJV will likely reject this
        },
      };
      const data = { name: 'test' };
      expect(() => schemaLoader.validateDataWithSchema(invalidSchema, data)).toThrow();
    });
  });

  describe('loadSchema (testing validateSchemaItself indirectly)', () => {
    const validSchemaContent = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        foo: { type: 'string' },
      },
    };

    const invalidSchemaContent_badType = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        foo: { type: 123 }, // Invalid type for 'type'
      },
    };
    
    const invalidSchemaContent_malformed = {
        // This schema is malformed in a way that ajv.validateSchema might throw an error
        type: "object",
        properties: "not-an-object"
    };


    it('should load and successfully validate a valid schema', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validSchemaContent));
      mockedFs.existsSync.mockReturnValue(true); // Assume file exists

      const schema = schemaLoader.loadSchema('validTestSchema');
      expect(schema).toEqual(validSchemaContent);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw an error when loading an invalid schema (bad type in property)', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(invalidSchemaContent_badType));
      mockedFs.existsSync.mockReturnValue(true);

      expect(() => schemaLoader.loadSchema('invalidTestSchema_badType')).toThrow(
        'Schema invalidTestSchema_badType is not a valid JSON Schema.'
      );
      // Check if logger.error was called by the validateSchemaItself method (via loadSchema)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Schema invalidTestSchema_badType is not a valid JSON Schema according to its meta-schema.'),
        expect.any(Object) // We don't need to check the exact error object here
      );
    });
    
    it('should throw an error when loading a malformed schema that causes ajv to error', () => {
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(invalidSchemaContent_malformed));
        mockedFs.existsSync.mockReturnValue(true);
  
        expect(() => schemaLoader.loadSchema('invalidTestSchema_malformed')).toThrow(
          'Schema invalidTestSchema_malformed is not a valid JSON Schema.'
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Schema invalidTestSchema_malformed is not a valid JSON Schema according to its meta-schema.'),
          expect.any(Object)
        );
      });

    it('should load a schema without validation if options.validate is false', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(invalidSchemaContent_badType));
      mockedFs.existsSync.mockReturnValue(true);

      const schema = schemaLoader.loadSchema('anotherInvalidSchema', { validate: false });
      expect(schema).toEqual(invalidSchemaContent_badType);
      // Ensure validateSchemaItself was not effectively causing an error due to being skipped
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Schema anotherInvalidSchema is not a valid JSON Schema according to its meta-schema.'),
        expect.any(Object)
      );
    });

    it('should throw an error if schema file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false); // Simulate file not existing
      expect(() => schemaLoader.loadSchema('nonExistentSchema')).toThrow(
        'Failed to load schema: nonExistentSchema'
      );
       expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load schema: nonExistentSchema',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });

    it('should throw an error if schema file is empty or invalid JSON', () => {
      mockedFs.readFileSync.mockReturnValue(''); // Simulate empty file
      mockedFs.existsSync.mockReturnValue(true);
      expect(() => schemaLoader.loadSchema('emptySchemaFile')).toThrow(
        // This error comes from JSON.parse
        expect.stringContaining('Failed to load schema: emptySchemaFile')
      );
       expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load schema: emptySchemaFile',
        expect.objectContaining({ error: expect.any(Error) })
      );

      mockedFs.readFileSync.mockReturnValue('{invalidJson'); // Simulate invalid JSON
      expect(() => schemaLoader.loadSchema('invalidJsonSchemaFile')).toThrow(
        expect.stringContaining('Failed to load schema: invalidJsonSchemaFile')
      );
       expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load schema: invalidJsonSchemaFile',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });
});