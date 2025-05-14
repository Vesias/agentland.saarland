import { SchemaLoader } from './schema-loader';

describe('SchemaLoader', () => {
  let schemaLoader: SchemaLoader;

  beforeEach(() => {
    schemaLoader = new SchemaLoader();
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
});