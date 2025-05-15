/**
 * Configuration Manager for the Claude Neural Framework
 * 
 * This file provides a centralized configuration interface for
 * all components of the Claude Neural Framework.
 * 
 * @module core/config/config-manager
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { z } from 'zod';
import { Logger } from '../logging/logger';

/**
 * Supported configuration types
 */
export enum ConfigType {
  RAG = 'rag',
  MCP = 'mcp',
  SECURITY = 'security',
  COLOR_SCHEMA = 'color_schema',
  GLOBAL = 'global',
  USER = 'user',
  I18N = 'i18n'
}

/**
 * Error types for configuration operations
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigValidationError extends ConfigError {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[] = []) {
    super(message);
    this.name = 'ConfigValidationError';
    this.validationErrors = validationErrors;
  }
}

export class ConfigAccessError extends ConfigError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigAccessError';
  }
}

/**
 * Default path for global Claude configurations
 */
const DEFAULT_GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.claude');

/**
 * Dynamically determines the project root directory.
 * It checks if the current execution path is within a 'dist' directory (build)
 * or directly in the source structure (development) and resolves accordingly.
 * @returns {string} The absolute path to the project root.
 */
function getProjectRoot(): string {
  // Check if 'dist' is in the path, indicating a build environment
  if (__dirname.includes(path.sep + 'dist' + path.sep)) {
    // Path for build structure: e.g., .../dist/libs/core/src/config -> ../../../../../
    return path.resolve(__dirname, '../../../../..');
  } else {
    // Path for development structure: e.g., .../libs/core/src/config -> ../../../..
    return path.resolve(__dirname, '../../../..');
  }
}

const PROJECT_ROOT = getProjectRoot();

/**
 * Local configuration paths, resolved relative to the project root.
 */
const LOCAL_CONFIG_PATHS: Record<string, string> = {
  [ConfigType.RAG]: path.join(PROJECT_ROOT, 'configs', 'rag', 'config.json'),
  [ConfigType.MCP]: path.join(PROJECT_ROOT, 'configs', 'mcp', 'config.json'), // Assuming mcp_config.json is named config.json in configs/mcp/
  [ConfigType.SECURITY]: path.join(PROJECT_ROOT, 'configs', 'security', 'constraints.json'),
  [ConfigType.COLOR_SCHEMA]: path.join(PROJECT_ROOT, 'configs', 'color-schema', 'config.json'),
  [ConfigType.I18N]: path.join(PROJECT_ROOT, 'configs', 'i18n', 'config.json')
};

/**
 * Interface for server configuration
 */
const ServerConfigSchema = z.object({
  enabled: z.boolean(),
  autostart: z.boolean(),
  command: z.string(),
  args: z.array(z.string()),
  description: z.string(),
  api_key_env: z.string().optional(),
}).strict();
export interface ServerConfig extends z.infer<typeof ServerConfigSchema> {}

/**
 * Interface for theme colors
 */
const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  success: z.string(),
  warning: z.string(),
  danger: z.string(),
  info: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.string(),
  textSecondary: z.string(),
  border: z.string(),
  shadow: z.string(),
}).strict();
interface ThemeColors extends z.infer<typeof ThemeColorsSchema> {}

/**
 * Interface for theme
 */
const ThemeSchema = z.object({
  name: z.string(),
  colors: ThemeColorsSchema,
}).strict();
interface Theme extends z.infer<typeof ThemeSchema> {}

/**
 * Interface for RAG configuration
 */
const RagConfigSchema = z.object({
  version: z.string(),
  database: z.object({
    type: z.string(),
    path: z.string(),
  }).strict(),
  embedding: z.object({
    model: z.string(),
    api_key_env: z.string(),
  }).strict(),
  claude: z.object({
    api_key_env: z.string(),
    model: z.string(),
  }).strict(),
}).strict();
interface RagConfig extends z.infer<typeof RagConfigSchema> {}

/**
 * Interface for MCP configuration
 */
const McpConfigSchema = z.object({
  version: z.string(),
  servers: z.record(ServerConfigSchema),
}).strict();
interface McpConfig extends z.infer<typeof McpConfigSchema> {}

/**
 * Interface for Security configuration
 */
const SecurityConfigSchema = z.object({
  version: z.string(),
  mcp: z.object({
    allowed_servers: z.array(z.string()),
    allow_server_autostart: z.boolean(),
    allow_remote_servers: z.boolean(),
  }).strict(),
  filesystem: z.object({
    allowed_directories: z.array(z.string()),
  }).strict(),
}).strict();
interface SecurityConfig extends z.infer<typeof SecurityConfigSchema> {}

/**
 * Interface for Color Schema configuration
 */
const ColorSchemaConfigSchema = z.object({
  version: z.string(),
  themes: z.record(ThemeSchema),
  userPreferences: z.object({
    activeTheme: z.string(),
    custom: ThemeSchema.nullable(),
  }).strict(),
}).strict();
interface ColorSchemaConfig extends z.infer<typeof ColorSchemaConfigSchema> {}

/**
 * Interface for Global configuration
 */
export const GlobalConfigSchema = z.object({
  version: z.string(),
  timezone: z.string(),
  language: z.string(),
  notifications: z.object({
    enabled: z.boolean(),
    showErrors: z.boolean(),
    showWarnings: z.boolean(),
  }).strict(),
  logging: z.object({
    level: z.number(),
    format: z.string(),
    colorize: z.boolean(),
    timestamp: z.boolean(),
    showSource: z.boolean(),
    showHostname: z.boolean(),
    consoleOutput: z.boolean(),
    fileOutput: z.boolean(),
  }).strict(),
}).strict();
export interface GlobalConfig extends z.infer<typeof GlobalConfigSchema> {}

/**
 * Interface for User configuration
 */
const UserConfigSchema = z.object({
  version: z.string(),
  user_id: z.string(),
  name: z.string(),
  preferences: z.object({
    theme: z.string(),
    language: z.string(),
  }).strict(),
}).strict();
interface UserConfig extends z.infer<typeof UserConfigSchema> {}

/**
 * Interface for I18n configuration
 */
const I18nConfigSchema = z.object({
  version: z.string(),
  locale: z.string(),
  fallbackLocale: z.string(),
  loadPath: z.string(),
  debug: z.boolean(),
  supportedLocales: z.array(z.string()),
  dateFormat: z.object({
    short: z.record(z.string()),
    medium: z.record(z.string()),
    long: z.record(z.string()),
  }).strict(),
  numberFormat: z.object({
    decimal: z.record(z.any()),
    percent: z.record(z.any()),
    currency: z.record(z.any()),
  }).strict(),
}).strict();
interface I18nConfig extends z.infer<typeof I18nConfigSchema> {}

/**
 * Type for all configuration types
 */
// Union schema for all config types
const ConfigDataSchema = z.union([
  RagConfigSchema,
  McpConfigSchema,
  SecurityConfigSchema,
  ColorSchemaConfigSchema,
  GlobalConfigSchema,
  UserConfigSchema,
  I18nConfigSchema,
]);
type ConfigData = z.infer<typeof ConfigDataSchema>;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIGS: Record<string, ConfigData> = {
  [ConfigType.GLOBAL]: {
    version: '1.0.0',
    timezone: 'UTC',
    language: 'en',
    notifications: {
      enabled: true,
      showErrors: true,
      showWarnings: true
    },
    logging: {
      level: 30,
      format: 'json',
      colorize: true,
      timestamp: true,
      showSource: true,
      showHostname: false,
      consoleOutput: true,
      fileOutput: false
    }
  } as GlobalConfig,
  [ConfigType.RAG]: {
    version: '1.0.0',
    database: {
      type: 'chroma',
      path: path.join(DEFAULT_GLOBAL_CONFIG_PATH, 'vector_store')
    },
    embedding: {
      model: 'voyage',
      api_key_env: 'VOYAGE_API_KEY'
    },
    claude: {
      api_key_env: 'CLAUDE_API_KEY',
      model: 'claude-3-sonnet-20240229'
    }
  } as RagConfig,
  [ConfigType.MCP]: {
    version: '1.0.0',
    servers: {
      sequentialthinking: {
        enabled: true,
        autostart: true,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
        description: 'Recursive thought generation for complex problems'
      },
      'brave-search': {
        enabled: true,
        autostart: false,
        command: 'npx',
        args: ['-y', '@smithery/cli@latest', 'run', '@smithery-ai/brave-search'],
        api_key_env: 'MCP_API_KEY',
        description: 'External knowledge acquisition'
      },
      'desktop-commander': {
        enabled: true,
        autostart: false,
        command: 'npx',
        args: ['-y', '@smithery/cli@latest', 'run', '@wonderwhy-er/desktop-commander', '--key', '${MCP_API_KEY}'],
        api_key_env: 'MCP_API_KEY',
        description: 'Filesystem integration and shell execution'
      },
      'context7-mcp': {
        enabled: true,
        autostart: false,
        command: 'npx',
        args: ['-y', '@smithery/cli@latest', 'run', '@upstash/context7-mcp', '--key', '${MCP_API_KEY}'],
        api_key_env: 'MCP_API_KEY',
        description: 'Context awareness and documentation access'
      },
      'think-mcp-server': {
        enabled: true,
        autostart: false,
        command: 'npx',
        args: ['-y', '@smithery/cli@latest', 'run', '@PhillipRt/think-mcp-server', '--key', '${MCP_API_KEY}'],
        api_key_env: 'MCP_API_KEY',
        description: 'Meta-cognitive reflection'
      }
    }
  } as McpConfig,
  [ConfigType.SECURITY]: {
    version: '1.0.0',
    mcp: {
      allowed_servers: [
        'sequentialthinking',
        'context7',
        'desktop-commander',
        'brave-search',
        'think-mcp'
      ],
      allow_server_autostart: true,
      allow_remote_servers: false
    },
    filesystem: {
      allowed_directories: [
        path.join(os.homedir(), 'claude_projects')
      ]
    }
  } as SecurityConfig,
  [ConfigType.COLOR_SCHEMA]: {
    version: '1.0.0',
    themes: {
      light: {
        name: 'Light Theme',
        colors: {
          primary: '#1565c0',
          secondary: '#7986cb',
          accent: '#ff4081',
          success: '#4caf50',
          warning: '#ff9800',
          danger: '#f44336',
          info: '#2196f3',
          background: '#f8f9fa',
          surface: '#ffffff',
          text: '#212121',
          textSecondary: '#757575',
          border: '#e0e0e0',
          shadow: 'rgba(0, 0, 0, 0.1)'
        }
      },
      dark: {
        name: 'Dark Theme',
        colors: {
          primary: '#1565c0',
          secondary: '#03dac6',
          accent: '#cf6679',
          success: '#4caf50',
          warning: '#ff9800',
          danger: '#cf6679',
          info: '#2196f3',
          background: '#121212',
          surface: '#1e1e1e',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          border: '#333333',
          shadow: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
    userPreferences: {
      activeTheme: 'dark',
      custom: null
    }
  } as ColorSchemaConfig,
  [ConfigType.USER]: {
    version: '1.0.0',
    user_id: `user-${Date.now()}`,
    name: 'Default User',
    preferences: {
      theme: 'dark',
      language: 'de'
    }
  } as UserConfig,
  [ConfigType.I18N]: {
    version: '1.0.0',
    locale: 'en',
    fallbackLocale: 'en',
    loadPath: 'core/i18n/locales/{{lng}}.json',
    debug: false,
    supportedLocales: ['en', 'fr', 'de'],
    dateFormat: {
      short: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      },
      medium: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    },
    numberFormat: {
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      currency: {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    }
  } as I18nConfig
};

/**
 * Interface for schema validation
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Interface for config manager options
 */
interface ConfigManagerOptions {
  globalConfigPath?: string;
  schemaValidation?: boolean;
  environmentOverrides?: boolean;
}

/**
 * Helper function to load a JSON configuration file
 * 
 * @param configPath - Path to the configuration file
 * @param defaultConfig - Default configuration if the file doesn't exist
 * @returns The loaded configuration
 * @throws {ConfigAccessError} If there's an error reading the file
 */
function loadJsonConfig(configPath: string, defaultConfig: Record<string, unknown> = {}): Record<string, unknown> {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (err) {
    console.warn(`Warning: Error loading configuration from ${configPath}: ${(err as Error).message}`);
    throw new ConfigAccessError(`Failed to load configuration from ${configPath}: ${(err as Error).message}`);
  }
  
  return defaultConfig;
}

/**
 * Helper function to save a JSON configuration file
 * 
 * @param configPath - Path to the configuration file
 * @param config - Configuration to save
 * @returns true on success, false on error
 * @throws {ConfigAccessError} If there's an error writing the file
 */
function saveJsonConfig(configPath: string, config: Record<string, unknown>): boolean {
  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving configuration to ${configPath}: ${(err as Error).message}`);
    throw new ConfigAccessError(`Failed to save configuration to ${configPath}: ${(err as Error).message}`);
  }
}

/**
 * Validates a configuration object against a Zod schema.
 *
 * @param config - Configuration object to validate.
 * @param schema - Zod schema to validate against.
 * @returns Validation result {valid: boolean, errors: string[]}.
 */
export function validateConfig<T extends z.ZodTypeAny>( // Exporting for testing
  config: unknown,
  schema: T
): SchemaValidationResult {
  try {
    schema.parse(config);
    return {
      valid: true,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(
          (err) => `${err.path.join('.')} - ${err.message}`
        ),
      };
    }
    // Handle unexpected errors
    return {
      valid: false,
      errors: ['An unexpected error occurred during validation.'],
    };
  }
}

/**
 * Returns the Zod schema for a given ConfigType.
 * @param configType The type of configuration.
 * @returns The corresponding Zod schema.
 * @throws {ConfigError} If the configType is unknown.
 */
export function getZodSchemaForConfigType(configType: ConfigType): z.ZodTypeAny { // Exporting for testing
  switch (configType) {
    case ConfigType.RAG:
      return RagConfigSchema;
    case ConfigType.MCP:
      return McpConfigSchema;
    case ConfigType.SECURITY:
      return SecurityConfigSchema;
    case ConfigType.COLOR_SCHEMA:
      return ColorSchemaConfigSchema;
    case ConfigType.GLOBAL:
      return GlobalConfigSchema;
    case ConfigType.USER:
      return UserConfigSchema;
    case ConfigType.I18N:
      return I18nConfigSchema;
    default:
      // This should ideally be caught by TypeScript if all ConfigType cases are handled.
      // However, as a runtime safeguard:
      const exhaustiveCheck: never = configType;
      throw new ConfigError(`Unknown configuration type for Zod schema: ${exhaustiveCheck}`);
  }
}

/**
 * Class for managing all configurations of the Claude Neural Framework
 */
export class ConfigManager {
  private globalConfigPath: string;
  private schemaValidation: boolean;
  private environmentOverrides: boolean;
  private configs: Record<string, ConfigData | null>;
  private schemas: Record<string, Record<string, any>>;
  private observers: Map<string, Map<string, (config: ConfigData) => void>>;
  private configVersions: Map<string, number>;
  private logger: Logger;

  /**
   * Creates a new instance of ConfigManager
   * 
   * @param options - Configuration options
   */
  private _initializeConfigMaps(): void {
    this.configs = {
      [ConfigType.RAG]: null,
      [ConfigType.MCP]: null,
      [ConfigType.SECURITY]: null,
      [ConfigType.COLOR_SCHEMA]: null,
      [ConfigType.GLOBAL]: null,
      [ConfigType.USER]: null,
      [ConfigType.I18N]: null
    };
    this.schemas = {};
    this.observers = new Map();
    this.configVersions = new Map();
  }

  private _ensureGlobalConfigPathExists(): void {
    if (!fs.existsSync(this.globalConfigPath)) {
      try {
        fs.mkdirSync(this.globalConfigPath, { recursive: true });
      } catch (err) {
        this.logger.error(`Failed to create global configuration directory: ${(err as Error).message}`);
        // Depending on severity, could throw an error here
      }
    }
  }

  constructor(options: ConfigManagerOptions = {}) {
    this.globalConfigPath = options.globalConfigPath || DEFAULT_GLOBAL_CONFIG_PATH;
    this.schemaValidation = options.schemaValidation !== undefined ? options.schemaValidation : true;
    this.environmentOverrides = options.environmentOverrides !== undefined ? options.environmentOverrides : true;
    this.logger = new Logger('ConfigManager');
    
    this._initializeConfigMaps();
    this._ensureGlobalConfigPathExists();
  }
  
  /**
   * Set schema for configuration validation
   * 
   * @param configType - Configuration type
   * @param schema - JSON Schema object
   */
  public setSchema(configType: ConfigType, schema: Record<string, unknown>): void {
    this.schemas[configType] = schema;
  }
  
  /**
   * Register observer for configuration changes
   * 
   * @param configType - Configuration type
   * @param callback - Callback function(config)
   * @returns Observer ID for unregistering
   */
  public registerObserver(configType: ConfigType, callback: (config: ConfigData) => void): string {
    const observerId = `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!this.observers.has(configType)) {
      this.observers.set(configType, new Map());
    }
    
    this.observers.get(configType)!.set(observerId, callback);
    return observerId;
  }
  
  /**
   * Unregister observer
   * 
   * @param configType - Configuration type
   * @param observerId - Observer ID
   * @returns Success
   */
  public unregisterObserver(configType: ConfigType, observerId: string): boolean {
    if (this.observers.has(configType)) {
      return this.observers.get(configType)!.delete(observerId);
    }
    return false;
  }
  
  /**
   * Notify observers of configuration changes
   * 
   * @param configType - Configuration type
   * @param config - New configuration
   * @private
   */
  private notifyObservers(configType: ConfigType, config: ConfigData): void {
    if (this.observers.has(configType)) {
      this.observers.get(configType)!.forEach(callback => {
        try {
          callback(config);
        } catch (err) {
          this.logger.error(`Error in observer callback for ${configType}`, { error: err });
        }
      });
    }
  }
  
  private _loadLocalConfigs(): void {
    Object.entries(LOCAL_CONFIG_PATHS).forEach(([configType, configPath]) => {
      try {
        this.configs[configType] = loadJsonConfig(configPath, DEFAULT_CONFIGS[configType]) as ConfigData;
        this.configVersions.set(configType, Date.now());
      } catch (err) {
        this.logger.error(`Failed to load ${configType} configuration`, { error: err });
        this.configs[configType] = DEFAULT_CONFIGS[configType]; // Fallback to default
      }
    });
  }

  private _loadGlobalConfig(): void {
    let loadedConfig: GlobalConfig | null = null;
    const globalConfigPath = path.join(this.globalConfigPath, 'config.json');
    try {
      const rawConfig = loadJsonConfig(globalConfigPath, {});
      if (Object.keys(rawConfig).length === 0 && !fs.existsSync(globalConfigPath)) {
        loadedConfig = DEFAULT_CONFIGS[ConfigType.GLOBAL] as GlobalConfig;
        this.logger.info(`Global config file ${globalConfigPath} not found. Using default.`);
      } else {
        const zodSchema = getZodSchemaForConfigType(ConfigType.GLOBAL);
        const validation = validateConfig(rawConfig, zodSchema);
        if (validation.valid) {
          loadedConfig = rawConfig as GlobalConfig;
        } else {
          this.logger.warn(`Validation failed for global configuration from ${globalConfigPath}. Errors: ${validation.errors.join(', ')}. Falling back to default.`);
          loadedConfig = DEFAULT_CONFIGS[ConfigType.GLOBAL] as GlobalConfig;
        }
      }
      this.configs[ConfigType.GLOBAL] = loadedConfig;
      this.configVersions.set(ConfigType.GLOBAL, Date.now());
    } catch (err) {
      this.logger.error(`Failed to load or validate global configuration from ${globalConfigPath}`, { error: err });
      this.configs[ConfigType.GLOBAL] = DEFAULT_CONFIGS[ConfigType.GLOBAL] as GlobalConfig; // Fallback
    }
  }

  private _loadUserConfig(): void {
    let loadedConfig: UserConfig | null = null;
    const userConfigPath = path.join(this.globalConfigPath, 'user.about.json');
    try {
      const rawConfig = loadJsonConfig(userConfigPath, {});
      if (Object.keys(rawConfig).length === 0 && !fs.existsSync(userConfigPath)) {
        loadedConfig = DEFAULT_CONFIGS[ConfigType.USER] as UserConfig;
        this.logger.info(`User config file ${userConfigPath} not found. Using default.`);
      } else {
        const zodSchema = getZodSchemaForConfigType(ConfigType.USER);
        const validation = validateConfig(rawConfig, zodSchema);
        if (validation.valid) {
          loadedConfig = rawConfig as UserConfig;
        } else {
          this.logger.warn(`Validation failed for user configuration from ${userConfigPath}. Errors: ${validation.errors.join(', ')}. Falling back to default.`);
          loadedConfig = DEFAULT_CONFIGS[ConfigType.USER] as UserConfig;
        }
      }
      this.configs[ConfigType.USER] = loadedConfig;
      this.configVersions.set(ConfigType.USER, Date.now());
    } catch (err) {
      this.logger.error(`Failed to load or validate user configuration from ${userConfigPath}`, { error: err });
      this.configs[ConfigType.USER] = DEFAULT_CONFIGS[ConfigType.USER] as UserConfig; // Fallback
    }
  }

  /**
   * Loads all configurations
   *
   * @returns All loaded configurations
   */
  public loadAllConfigs(): Record<string, ConfigData | null> {
    this._loadLocalConfigs();
    this._loadGlobalConfig();
    this._loadUserConfig();
    return this.configs;
  }
  
  /**
   * Loads a specific configuration
   * 
   * @param configType - Configuration type
   * @returns The loaded configuration
   * @throws {ConfigError} If the configuration type is unknown
   */
  private _loadSpecificLocalConfig(configType: ConfigType): void {
    if (LOCAL_CONFIG_PATHS[configType]) {
      let loadedConfig: ConfigData | null = null;
      try {
        // Lade Konfiguration ohne Default, um leere/fehlerhafte Dateien besser zu behandeln
        const rawConfig = loadJsonConfig(LOCAL_CONFIG_PATHS[configType], {}); 
        if (Object.keys(rawConfig).length === 0 && !fs.existsSync(LOCAL_CONFIG_PATHS[configType])) {
            // Datei existiert nicht, Default verwenden
            loadedConfig = DEFAULT_CONFIGS[configType] as ConfigData;
            this.logger.info(`Config file ${LOCAL_CONFIG_PATHS[configType]} not found for ${configType}. Using default.`);
        } else {
            const zodSchema = getZodSchemaForConfigType(configType);
            const validation = validateConfig(rawConfig, zodSchema);
            if (validation.valid) {
              loadedConfig = rawConfig as ConfigData;
            } else {
              this.logger.warn(`Validation failed for ${configType} configuration from ${LOCAL_CONFIG_PATHS[configType]}. Errors: ${validation.errors.join(', ')}. Falling back to default.`);
              loadedConfig = DEFAULT_CONFIGS[configType] as ConfigData;
            }
        }
        this.configs[configType] = loadedConfig;
        this.configVersions.set(configType, Date.now());
      } catch (err) { // Catch errors from loadJsonConfig or other unexpected issues
        this.logger.error(`Failed to load or validate ${configType} configuration from ${LOCAL_CONFIG_PATHS[configType]}`, { error: err });
        this.configs[configType] = DEFAULT_CONFIGS[configType] as ConfigData; // Fallback to default
      }
    } else {
      // This case should ideally not be reached if configType is a valid local config type
      throw new ConfigError(`Unknown or non-local configuration type for _loadSpecificLocalConfig: ${configType}`);
    }
  }

  private _ensureConfigLoaded(configType: ConfigType): void {
    if (!this.configs[configType]) {
      if (configType === ConfigType.GLOBAL) {
        this._loadGlobalConfig();
      } else if (configType === ConfigType.USER) {
        this._loadUserConfig();
      } else if (LOCAL_CONFIG_PATHS[configType]) {
        this._loadSpecificLocalConfig(configType);
      } else {
        throw new ConfigError(`Unknown configuration type: ${configType}`);
      }
    }
  }

  public getConfig<T extends ConfigData>(configType: ConfigType): T {
    this._ensureConfigLoaded(configType);
    
    // Apply environment overrides if the config was just loaded or needs re-evaluation
    // This check might need refinement if overrides should only be applied once per session
    if (this.environmentOverrides) {
      // Ensure config is not null before applying overrides, though _ensureConfigLoaded should handle it.
      if (this.configs[configType]) {
        this.applyEnvironmentOverrides(configType, this.configs[configType]!);
      }
    }
    
    return this.configs[configType] as T;
  }
  
  /**
   * Apply environment variable overrides to configuration
   * Environment variables follow the pattern: CNF_[CONFIG_TYPE]_[KEY_PATH]
   * Example: CNF_RAG_DATABASE_TYPE="lancedb"
   * 
   * @param configType - Configuration type
   * @param config - Configuration object
   * @private
   */
  private _parseEnvValue(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If not valid JSON, return as string
      return value;
    }
  }

  private applyEnvironmentOverrides(configType: ConfigType, config: ConfigData): void {
    const prefix = `CNF_${configType.toUpperCase()}_`;
    
    Object.keys(process.env)
      .filter(key => key.startsWith(prefix))
      .forEach(key => {
        const keyPath = key.substring(prefix.length).toLowerCase().replace(/_/g, '.');
        const value = process.env[key]!;
        const parsedValue = this._parseEnvValue(value);
        this.setConfigValueByPath(config as Record<string, unknown>, keyPath, parsedValue);
      });
  }
  
  /**
   * Set configuration value by path
   * 
   * @param config - Configuration object
   * @param keyPath - Key path (e.g. 'database.type')
   * @param value - Value to set
   * @private
   */
  private setConfigValueByPath(config: Record<string, unknown>, keyPath: string, value: unknown): void {
    const keyParts = keyPath.split('.');
    let target = config;
    
    for (let i = 0; i < keyParts.length - 1; i++) {
      const part = keyParts[i];
      
      if (!(part in target)) {
        target[part] = {};
      }
      
      target = target[part] as Record<string, unknown>;
    }
    
    target[keyParts[keyParts.length - 1]] = value;
  }
  
  /**
   * Saves a configuration
   * 
   * @param configType - Configuration type
   * @param config - Configuration to save
   * @returns Success
   * @throws {ConfigError} If the configuration type is unknown
   * @throws {ConfigValidationError} If schema validation fails
   */
  private _validateAndPrepareSave(configType: ConfigType, config: ConfigData): ConfigData {
    if (this.schemaValidation) {
      const zodSchema = getZodSchemaForConfigType(configType);
      const validation = validateConfig(config, zodSchema);
      if (!validation.valid) {
        throw new ConfigValidationError(
          `Invalid configuration for ${configType}`,
          validation.errors
        );
      }
    }
    this.configs[configType] = config;
    this.configVersions.set(configType, Date.now());
    return config;
  }

  private _saveGlobalConfigInternal(config: GlobalConfig): void {
    try {
      const globalConfigPath = path.join(this.globalConfigPath, 'config.json');
      saveJsonConfig(globalConfigPath, config as Record<string, unknown>);
      this.notifyObservers(ConfigType.GLOBAL, config);
    } catch (err) {
      this.logger.error(`Failed to save global configuration`, { error: err });
      throw err; // Re-throw to be caught by the public saveConfig method
    }
  }

  private _saveUserConfigInternal(config: UserConfig): void {
    try {
      const userConfigPath = path.join(this.globalConfigPath, 'user.about.json');
      saveJsonConfig(userConfigPath, config as Record<string, unknown>);
      this.notifyObservers(ConfigType.USER, config);
    } catch (err) {
      this.logger.error(`Failed to save user configuration`, { error: err });
      throw err;
    }
  }

  private _saveLocalConfigInternal(configType: ConfigType, config: ConfigData): void {
    if (!LOCAL_CONFIG_PATHS[configType]) {
      throw new ConfigError(`Cannot save: No local path defined for ${configType}`);
    }
    try {
      saveJsonConfig(LOCAL_CONFIG_PATHS[configType], config as Record<string, unknown>);
      this.notifyObservers(configType, config);
    } catch (err) {
      this.logger.error(`Failed to save ${configType} configuration`, { error: err });
      throw err;
    }
  }

  public saveConfig(configType: ConfigType, configData: ConfigData): boolean {
    const preparedConfig = this._validateAndPrepareSave(configType, configData);
    
    if (configType === ConfigType.GLOBAL) {
      this._saveGlobalConfigInternal(preparedConfig as GlobalConfig);
    } else if (configType === ConfigType.USER) {
      this._saveUserConfigInternal(preparedConfig as UserConfig);
    } else if (LOCAL_CONFIG_PATHS[configType]) {
      this._saveLocalConfigInternal(configType, preparedConfig);
    } else {
      throw new ConfigError(`Unknown configuration type for saving: ${configType}`);
    }
    return true; // If no error is thrown, saving was successful
  }
  
  /**
   * Updates a configuration value
   * 
   * @param configType - Configuration type
   * @param keyPath - Key path (e.g. 'database.type' or 'servers.brave-search.enabled')
   * @param value - New value
   * @returns Success
   * @throws {ConfigError} If the configuration type is unknown
   */
  public updateConfigValue(configType: ConfigType, keyPath: string, value: unknown): boolean {
    const config = this.getConfig(configType);
    
    // Split path into parts
    const keyParts = keyPath.split('.');
    
    // Find reference to target object
    let target = config as Record<string, unknown>;
    for (let i = 0; i < keyParts.length - 1; i++) {
      const part = keyParts[i];
      
      if (!(part in target)) {
        target[part] = {};
      }
      
      target = target[part] as Record<string, unknown>;
    }
    
    // Set value
    target[keyParts[keyParts.length - 1]] = value;
    
    // Save configuration
    return this.saveConfig(configType, config);
  }
  
  private _getValueByPath<T = unknown>(config: Record<string, unknown>, keyPath: string, defaultValue?: T): T {
    const keyParts = keyPath.split('.');
    let target: unknown = config;

    for (const part of keyParts) {
      if (target === undefined || target === null || typeof target !== 'object' || !(part in target)) {
        return defaultValue as T;
      }
      target = (target as Record<string, unknown>)[part];
    }
    return target as T;
  }

  private _getGlobalColorSchemaValue<T = unknown>(keyPath: string, defaultValue?: T): T {
    try {
      const colorSchemaConfig = this.getConfig<ColorSchemaConfig>(ConfigType.COLOR_SCHEMA);
      if (keyPath === 'COLOR_SCHEMA') {
        return {
          activeTheme: colorSchemaConfig.userPreferences?.activeTheme || 'dark'
        } as unknown as T;
      }
      const subPath = keyPath.substring('COLOR_SCHEMA.'.length);
      // Use _getValueByPath for the sub-config to avoid recursive calls to getConfigValue for the same configType
      return this._getValueByPath<T>(colorSchemaConfig as Record<string, unknown>, subPath, defaultValue);
    } catch (err) {
      this.logger.warn(`Failed to get COLOR_SCHEMA config for global access`, { error: err, keyPath });
      return defaultValue as T;
    }
  }

  private _getGlobalMcpValue<T = unknown>(keyPath: string, defaultValue?: T): T {
    try {
      const mcpConfig = this.getConfig<McpConfig>(ConfigType.MCP);
      if (keyPath === 'MCP') {
        return mcpConfig as unknown as T;
      }
      const subPath = keyPath.substring('MCP.'.length);
      // Use _getValueByPath for the sub-config
      return this._getValueByPath<T>(mcpConfig as Record<string, unknown>, subPath, defaultValue);
    } catch (err) {
      this.logger.warn(`Failed to get MCP config for global access`, { error: err, keyPath });
      return defaultValue as T;
    }
  }

  /**
   * Gets a configuration value
   *
   * @param configType - Configuration type
   * @param keyPath - Key path (e.g. 'database.type' or 'servers.brave-search.enabled')
   * @param defaultValue - Default value if the key doesn't exist
   * @returns The configuration value or the default value
   * @throws {ConfigError} If the configuration type is unknown
   */
  public getConfigValue<T = unknown>(configType: ConfigType, keyPath: string, defaultValue?: T): T {
    try {
      const config = this.getConfig(configType);

      if (configType === ConfigType.GLOBAL) {
        if (keyPath === 'COLOR_SCHEMA' || keyPath.startsWith('COLOR_SCHEMA.')) {
          return this._getGlobalColorSchemaValue<T>(keyPath, defaultValue);
        }
        if (keyPath === 'MCP' || keyPath.startsWith('MCP.')) {
          return this._getGlobalMcpValue<T>(keyPath, defaultValue);
        }
      }
      
      return this._getValueByPath<T>(config as Record<string, unknown>, keyPath, defaultValue);
    } catch (err) {
      this.logger.warn(`Error in getConfigValue for ${configType}.${keyPath}`, { error: err });
      return defaultValue as T;
    }
  }
  
  /**
   * Reset a configuration to default values
   * 
   * @param configType - Configuration type
   * @returns Success
   * @throws {ConfigError} If the configuration type is unknown
   */
  public resetConfig(configType: ConfigType): boolean {
    if (!DEFAULT_CONFIGS[configType]) {
      throw new ConfigError(`Unknown configuration type: ${configType}`);
    }
    
    return this.saveConfig(configType, JSON.parse(JSON.stringify(DEFAULT_CONFIGS[configType])));
  }
  
  /**
   * Check if an API key is available for a specific service
   * 
   * @param service - Service name ('claude', 'voyage', 'brave')
   * @returns true if the API key is available, false otherwise
   */
  public hasApiKey(service: 'claude' | 'voyage' | 'brave'): boolean {
    let apiKeyEnv: string;
    
    switch (service) {
      case 'claude':
        apiKeyEnv = this.getConfigValue<string>(ConfigType.RAG, 'claude.api_key_env', 'CLAUDE_API_KEY');
        break;
      case 'voyage':
        apiKeyEnv = this.getConfigValue<string>(ConfigType.RAG, 'embedding.api_key_env', 'VOYAGE_API_KEY');
        break;
      case 'brave':
        apiKeyEnv = this.getConfigValue<string>(ConfigType.MCP, 'servers.brave-search.api_key_env', 'BRAVE_API_KEY');
        break;
      default:
        return false;
    }
    
    return Boolean(process.env[apiKeyEnv]);
  }
  
  /**
   * Get environment variables used by the framework
   * 
   * @returns Environment variables mapping
   */
  public getEnvironmentVariables(): Record<string, string> {
    return {
      CLAUDE_API_KEY: this.getConfigValue<string>(ConfigType.RAG, 'claude.api_key_env', 'CLAUDE_API_KEY'),
      VOYAGE_API_KEY: this.getConfigValue<string>(ConfigType.RAG, 'embedding.api_key_env', 'VOYAGE_API_KEY'),
      BRAVE_API_KEY: this.getConfigValue<string>(ConfigType.MCP, 'servers.brave-search.api_key_env', 'BRAVE_API_KEY'),
      MCP_API_KEY: 'MCP_API_KEY'
    };
  }
  
  /**
   * Export configuration to file
   * 
   * @param configType - Configuration type
   * @param exportPath - Export file path
   * @returns Success
   * @throws {ConfigError} If the configuration type is unknown
   */
  public exportConfig(configType: ConfigType, exportPath: string): boolean {
    const config = this.getConfig(configType);
    
    try {
      saveJsonConfig(exportPath, config as Record<string, unknown>);
      return true;
    } catch (err) {
      this.logger.error(`Failed to export ${configType} configuration`, { error: err });
      throw new ConfigAccessError(`Failed to export configuration to ${exportPath}: ${(err as Error).message}`);
    }
  }
  
  /**
   * Import configuration from file
   * 
   * @param configType - Configuration type
   * @param importPath - Import file path
   * @returns Success
   * @throws {ConfigError} If the configuration type is unknown
   * @throws {ConfigValidationError} If schema validation fails
   */
  private _loadConfigForImport(importPath: string): ConfigData {
    // loadJsonConfig will throw if the file doesn't exist and no default is provided,
    // or return an empty object if a default is not provided and the file is empty.
    const config = loadJsonConfig(importPath); // No default config

    // Check if the file existed but was empty, or if it didn't exist and loadJsonConfig returned {}.
    // fs.existsSync is crucial here.
    if (Object.keys(config).length === 0 && !fs.existsSync(importPath)) {
      throw new ConfigAccessError(`Configuration file not found: ${importPath}`);
    }
    // If file exists but is empty (or only whitespace), JSON.parse would have thrown or returned an empty object.
    // loadJsonConfig handles the JSON.parse error and would throw ConfigAccessError.
    // If it returns an empty object for an existing empty file, that's fine, Zod validation in saveConfig will catch it if invalid.
    return config as ConfigData;
  }

  public importConfig(configType: ConfigType, importPath: string): boolean {
    try {
      const configToImport = this._loadConfigForImport(importPath);
      // saveConfig will perform Zod validation and then save.
      return this.saveConfig(configType, configToImport);
    } catch (err) {
      // Log the original error if it's a ConfigError or ConfigAccessError, otherwise wrap it.
      if (err instanceof ConfigError) { // Catches ConfigAccessError and ConfigValidationError too
        this.logger.error(`Failed to import ${configType} configuration from ${importPath}: ${err.message}`, { error: err });
        throw err; // Re-throw the original, more specific error
      }
      // For other unexpected errors during the import process (e.g., fs errors not caught by loadJsonConfig)
      const importError = new ConfigAccessError(`Unexpected error during import of ${configType} from ${importPath}: ${(err as Error).message}`);
      this.logger.error(importError.message, { originalError: err });
      throw importError;
    }
  }
}

// Create the singleton instance
const configManager = new ConfigManager();

// Export as default
export default configManager;
