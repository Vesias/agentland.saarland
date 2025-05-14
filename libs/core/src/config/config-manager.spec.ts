import { z } from 'zod';
import { ConfigValidationError, GlobalConfigSchema, validateConfig, SchemaValidationResult, ConfigType, getZodSchemaForConfigType, GlobalConfig } from './config-manager';

// Helper function to access the internal validateConfig for testing, 
// as it's not directly exported from the module in the provided snippet.
// In a real scenario, you would test the public API that uses validateConfig,
// or export validateConfig for testing.
// For this exercise, we'll assume a way to test it, perhaps by exporting it or testing through saveConfig.
// Let's rename the validateConfig in config-manager.ts to validateConfigWithZod for clarity if needed
// and export it for testing if it's not already.
// For now, I'll write tests assuming `validateConfig` is the function we refactored and can be imported.
// If `validateConfig` is not exported, these tests would target `saveConfig` or `ConfigManager` methods that use it.

// Re-importing the actual validateConfig function.
// The previous `validateConfig` was a placeholder name in the thinking process.
// The actual function to test is the one modified to use Zod.
// Let's assume the refactored validateConfig is available for testing.
// If it's a private helper, tests would be more indirect.
// Given the instructions, we are testing the `validateConfig` logic.

// The `validateConfig` function is now exported from config-manager.ts
// We can use it directly for testing the validation logic.

describe('validateConfig with Zod', () => {
  const globalSchema = getZodSchemaForConfigType(ConfigType.GLOBAL) as z.ZodType<GlobalConfig>; // Cast for type safety

  it('should validate a correct GlobalConfig', () => {
    const validConfig: GlobalConfig = {
      version: '1.0.0',
      timezone: 'UTC',
      language: 'en',
      notifications: {
        enabled: true,
        showErrors: true,
        showWarnings: true,
      },
      logging: {
        level: 30,
        format: 'json',
        colorize: true,
        timestamp: true,
        showSource: true,
        showHostname: false,
        consoleOutput: true,
        fileOutput: false,
      },
    };
    const result = validateConfig(validConfig, globalSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should invalidate a GlobalConfig with a missing required field (version)', () => {
    const invalidConfig = {
      // version is missing
      timezone: 'UTC',
      language: 'en',
      notifications: {
        enabled: true,
        showErrors: true,
        showWarnings: true,
      },
      logging: {
        level: 30,
        format: 'json',
        colorize: true,
        timestamp: true,
        showSource: true,
        showHostname: false,
        consoleOutput: true,
        fileOutput: false,
      },
    };
    const result = validateConfig(invalidConfig, globalSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('version - Required');
  });

  it('should invalidate a GlobalConfig with an incorrect type (logging.level as string)', () => {
    const invalidConfig: any = {
      version: '1.0.0',
      timezone: 'UTC',
      language: 'en',
      notifications: {
        enabled: true,
        showErrors: true,
        showWarnings: true,
      },
      logging: {
        level: "should-be-number", // Incorrect type
        format: 'json',
        colorize: true,
        timestamp: true,
        showSource: true,
        showHostname: false,
        consoleOutput: true,
        fileOutput: false,
      },
    };
    const result = validateConfig(invalidConfig, globalSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('logging.level - Expected number, received string');
  });

  it('should invalidate a GlobalConfig with an incorrect nested object type (notifications.enabled as string)', () => {
    const invalidConfig: any = {
      version: '1.0.0',
      timezone: 'UTC',
      language: 'en',
      notifications: {
        enabled: "should-be-boolean", // Incorrect type
        showErrors: true,
        showWarnings: true,
      },
      logging: {
        level: 30,
        format: 'json',
        colorize: true,
        timestamp: true,
        showSource: true,
        showHostname: false,
        consoleOutput: true,
        fileOutput: false,
      },
    };
    const result = validateConfig(invalidConfig, globalSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('notifications.enabled - Expected boolean, received string');
  });

  it('should return a generic error for non-ZodError during validation', () => {
    const faultySchema = {
      parse: () => {
        throw new Error("Non-Zod error");
      }
    } as any as z.ZodTypeAny;
    const config = {};
    // We are testing the exported validateConfig directly
    const result = validateConfig(config, faultySchema);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['An unexpected error occurred during validation.']);
  });

});