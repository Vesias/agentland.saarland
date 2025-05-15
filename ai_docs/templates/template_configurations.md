---
title: "Configuration Standards for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
status: "active"
---

# Configuration Standards for agentland.saarland

This template defines the configuration standards and patterns for agentland.saarland projects. It covers environment variables, configuration files, and configuration management strategies.

## Environment Variables

### .env File Structure

All projects should include a `.env.example` file in the root directory with the following structure:

```bash
# ==================================================
# agentland.saarland Environment Configuration
# ==================================================

# Environment (development, test, production)
NODE_ENV=development

# ==================================================
# Security Configuration
# ==================================================

# A2A Security
A2A_JWT_SECRET=
A2A_JWT_ISSUER=a2a-manager
A2A_JWT_AUDIENCE=a2a-agents
A2A_JWT_EXPIRES_IN=1d

# Web Security
SESSION_SECRET=
CORS_ORIGINS=http://localhost:5000
CSP_REPORT_URI=

# ==================================================
# MCP Configuration
# ==================================================

# MCP API Keys
MCP_API_KEY=
MCP_PROFILE=

# MCP Servers
MCP_SERVER_URL=
MCP_THINKING_SERVER_URL=
MCP_CONTEXT_SERVER_URL=
MCP_BRAVE_SEARCH_URL=
MCP_IMAGEN_SERVER_URL=

# ==================================================
# RAG Configuration
# ==================================================

# RAG API Keys
RAG_API_KEY=

# RAG Paths
RAG_VECTOR_DB_PATH=
RAG_INDEX_PATH=
RAG_MODEL_PATH=

# ==================================================
# Database Configuration
# ==================================================

# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=agentland

# ==================================================
# Server Configuration
# ==================================================

# Web Server
PORT=5000
HOST=localhost
API_BASE_URL=http://localhost:5000/api

# ==================================================
# Logging Configuration
# ==================================================

# Log Levels (error, warn, info, http, verbose, debug, silly)
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# ==================================================
# Feature Flags
# ==================================================

ENABLE_MCP_INTEGRATION=true
ENABLE_RAG=true
ENABLE_A2A_SECURITY=true
```

### Environment Variable Validation

All applications should validate required environment variables at startup:

```typescript
// libs/core/src/config/env-validator.ts
import { logger } from '../logging/logger';

export interface EnvValidationOptions {
  throwOnMissing?: boolean;
  logLevel?: 'error' | 'warn' | 'info';
}

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  message: string;
}

export function validateEnv(
  requiredVars: string[],
  options: EnvValidationOptions = { throwOnMissing: true, logLevel: 'error' }
): EnvValidationResult {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  const isValid = missingVars.length === 0;
  const message = isValid
    ? 'All required environment variables are present.'
    : `Missing required environment variables: ${missingVars.join(', ')}`;
  
  if (!isValid) {
    if (options.logLevel === 'error') {
      logger.error(message);
    } else if (options.logLevel === 'warn') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
    
    if (options.throwOnMissing) {
      throw new Error(message);
    }
  }
  
  return { isValid, missingVars, message };
}
```

### Environment-Specific Configuration

For different environments, use multiple .env files:

- `.env.development` - Development environment
- `.env.test` - Test environment
- `.env.production` - Production environment

Load the appropriate environment file based on NODE_ENV:

```typescript
// libs/core/src/config/config-manager.ts
import dotenv from 'dotenv';
import path from 'path';
import { validateEnv } from './env-validator';

export function loadEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
  
  // Load environment variables from file
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    // Fallback to default .env file
    dotenv.config();
  }
  
  // Validate required environment variables
  validateEnv([
    'NODE_ENV',
    // Add other required variables based on the application
  ]);
}
```

## Configuration Files

### Global Configuration

Global configuration is managed in `configs/global.json`:

```json
{
  "appName": "agentland.saarland",
  "version": "1.0.0",
  "description": "Claude Neural Framework",
  "maintainer": "maintenance@agentland.saarland",
  "defaultLanguage": "de",
  "supportedLanguages": ["de", "en", "fr"],
  "features": {
    "mcp": true,
    "rag": true,
    "a2a": true,
    "sequential": true
  },
  "paths": {
    "data": "./data",
    "logs": "./logs",
    "temp": "./tmp"
  }
}
```

### Component-Specific Configuration

Component-specific configuration should be stored in `configs/<component>/config.json`:

```json
// configs/mcp/config.json
{
  "enabled": true,
  "baseUrl": "${MCP_SERVER_URL}",
  "apiKey": "${MCP_API_KEY}",
  "profile": "${MCP_PROFILE}",
  "timeout": 30000,
  "services": {
    "thinking": {
      "url": "${MCP_THINKING_SERVER_URL}",
      "enabled": true
    },
    "context": {
      "url": "${MCP_CONTEXT_SERVER_URL}",
      "enabled": true
    },
    "search": {
      "url": "${MCP_BRAVE_SEARCH_URL}",
      "enabled": true
    },
    "imagen": {
      "url": "${MCP_IMAGEN_SERVER_URL}",
      "enabled": true
    }
  }
}
```

### Schema Validation

All configuration files should have corresponding JSON schemas:

```json
// libs/core/src/schemas/mcp/mcp-config-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["enabled", "baseUrl"],
  "properties": {
    "enabled": {
      "type": "boolean",
      "description": "Enable or disable MCP integration"
    },
    "baseUrl": {
      "type": "string",
      "description": "MCP server base URL"
    },
    "apiKey": {
      "type": "string",
      "description": "MCP API key"
    },
    "profile": {
      "type": "string",
      "description": "MCP profile"
    },
    "timeout": {
      "type": "number",
      "description": "Request timeout in milliseconds"
    },
    "services": {
      "type": "object",
      "properties": {
        "thinking": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "enabled": {
              "type": "boolean"
            }
          }
        },
        "context": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "enabled": {
              "type": "boolean"
            }
          }
        },
        "search": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "enabled": {
              "type": "boolean"
            }
          }
        },
        "imagen": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "enabled": {
              "type": "boolean"
            }
          }
        }
      }
    }
  }
}
```

## Configuration Manager

The configuration manager is responsible for loading, validating, and providing access to configuration:

```typescript
// libs/core/src/config/config-manager.ts
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { logger } from '../logging/logger';
import { interpolateEnv } from './env-interpolator';

export interface ConfigManagerOptions {
  configDir?: string;
  schemaDir?: string;
  validateSchemas?: boolean;
}

export class ConfigManager {
  private configCache: Map<string, any> = new Map();
  private configDir: string;
  private schemaDir: string;
  private validateSchemas: boolean;
  
  constructor(options: ConfigManagerOptions = {}) {
    this.configDir = options.configDir || path.resolve(process.cwd(), 'configs');
    this.schemaDir = options.schemaDir || path.resolve(process.cwd(), 'libs/core/src/schemas');
    this.validateSchemas = options.validateSchemas !== false;
  }
  
  /**
   * Load a configuration file
   * @param name Configuration name (e.g., 'mcp', 'rag')
   * @param file Optional file name (defaults to 'config.json')
   * @returns Configuration object
   */
  public loadConfig<T = any>(name: string, file: string = 'config.json'): T {
    const cacheKey = `${name}/${file}`;
    
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey) as T;
    }
    
    const configPath = path.join(this.configDir, name, file);
    
    try {
      // Read the configuration file
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // Parse the configuration
      const configJson = JSON.parse(configContent);
      
      // Interpolate environment variables
      const interpolatedConfig = interpolateEnv(configJson);
      
      // Validate against schema if enabled
      if (this.validateSchemas) {
        this.validateConfig(name, interpolatedConfig);
      }
      
      // Cache the configuration
      this.configCache.set(cacheKey, interpolatedConfig);
      
      return interpolatedConfig as T;
    } catch (error) {
      logger.error(`Failed to load configuration: ${name}/${file}`, error);
      throw error;
    }
  }
  
  /**
   * Validate a configuration against its schema
   * @param name Configuration name
   * @param config Configuration object
   */
  private validateConfig(name: string, config: any): void {
    try {
      const schemaPath = path.join(this.schemaDir, name, `${name}-config-schema.json`);
      
      if (!fs.existsSync(schemaPath)) {
        logger.warn(`No schema found for configuration: ${name}`);
        return;
      }
      
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Use zod for validation
      const zodSchema = this.convertJsonSchemaToZod(schema);
      zodSchema.parse(config);
    } catch (error) {
      logger.error(`Configuration validation failed for: ${name}`, error);
      throw error;
    }
  }
  
  /**
   * Convert JSON Schema to Zod schema (simplified version)
   * @param jsonSchema JSON Schema object
   * @returns Zod schema
   */
  private convertJsonSchemaToZod(jsonSchema: any): z.ZodType<any> {
    // Simplified implementation - in practice, this would be more complex
    // to handle all JSON Schema features
    
    if (jsonSchema.type === 'object') {
      const shape: Record<string, z.ZodType<any>> = {};
      
      if (jsonSchema.properties) {
        for (const [key, prop] of Object.entries<any>(jsonSchema.properties)) {
          shape[key] = this.convertJsonSchemaToZod(prop);
        }
      }
      
      let schema = z.object(shape);
      
      if (jsonSchema.required && Array.isArray(jsonSchema.required)) {
        // Make required properties non-optional
        for (const requiredProp of jsonSchema.required) {
          if (shape[requiredProp]) {
            shape[requiredProp] = shape[requiredProp].nonoptional();
          }
        }
        schema = z.object(shape);
      }
      
      return schema;
    } else if (jsonSchema.type === 'array') {
      return z.array(
        jsonSchema.items ? this.convertJsonSchemaToZod(jsonSchema.items) : z.any()
      );
    } else if (jsonSchema.type === 'string') {
      return z.string();
    } else if (jsonSchema.type === 'number') {
      return z.number();
    } else if (jsonSchema.type === 'boolean') {
      return z.boolean();
    } else if (jsonSchema.type === 'null') {
      return z.null();
    } else {
      return z.any();
    }
  }
}

// Helper function to interpolate environment variables in configuration
function interpolateEnv(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\${([^}]+)}/g, (_, envVar) => {
      return process.env[envVar] || '';
    });
  } else if (Array.isArray(obj)) {
    return obj.map(interpolateEnv);
  } else if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateEnv(value);
    }
    return result;
  }
  return obj;
}

// Export a singleton instance
export const configManager = new ConfigManager();
```

## Environment Variable Interpolation

Configuration files support environment variable interpolation using the `${VAR_NAME}` syntax:

```typescript
// libs/core/src/config/env-interpolator.ts
export function interpolateEnv(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\${([^}]+)}/g, (_, envVar) => {
      return process.env[envVar] || '';
    });
  } else if (Array.isArray(obj)) {
    return obj.map(interpolateEnv);
  } else if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateEnv(value);
    }
    return result;
  }
  return obj;
}
```

## Feature Flags

Feature flags are managed in the global configuration:

```json
// configs/global.json
{
  "features": {
    "mcp": true,
    "rag": true,
    "a2a": true,
    "sequential": true,
    "experimental": {
      "newDashboard": false,
      "advancedAi": false
    }
  }
}
```

Access feature flags through the configuration manager:

```typescript
// Feature flag usage
import { configManager } from '../config/config-manager';

const globalConfig = configManager.loadConfig('global');

if (globalConfig.features.mcp) {
  // MCP feature is enabled
}

if (globalConfig.features.experimental.newDashboard) {
  // New dashboard feature is enabled
}
```

## Examples of Configuration Files

### MCP Server Configuration

```json
// configs/mcp/servers.json
{
  "servers": [
    {
      "id": "sequentialthinking",
      "name": "Sequential Thinking",
      "url": "${MCP_THINKING_SERVER_URL}",
      "apiKey": "${MCP_API_KEY}",
      "enabled": true,
      "timeout": 30000,
      "description": "Recursive thought generation"
    },
    {
      "id": "context7",
      "name": "Context 7",
      "url": "${MCP_CONTEXT_SERVER_URL}",
      "apiKey": "${MCP_API_KEY}",
      "enabled": true,
      "timeout": 20000,
      "description": "Context awareness and documentation access"
    },
    {
      "id": "brave-search",
      "name": "Brave Search",
      "url": "${MCP_BRAVE_SEARCH_URL}",
      "apiKey": "${MCP_API_KEY}",
      "enabled": true,
      "timeout": 10000,
      "description": "External knowledge acquisition"
    },
    {
      "id": "imagen-3-0-generate",
      "name": "Imagen 3.0",
      "url": "${MCP_IMAGEN_SERVER_URL}",
      "apiKey": "${MCP_API_KEY}",
      "enabled": true,
      "timeout": 60000,
      "description": "Image generation"
    }
  ]
}
```

### Security Configuration

```json
// configs/security/dns-security.json
{
  "dnsVerification": {
    "enabled": true,
    "requiredRecords": [
      {
        "domain": "agentland.saarland",
        "type": "TXT",
        "value": "${DNS_VERIFICATION_VALUE}"
      }
    ],
    "cacheTtl": 3600
  },
  "messageValidation": {
    "enabled": true,
    "requiredFields": ["timestamp", "agent", "messageId"],
    "maxMessageAge": 300000
  },
  "priorityManagement": {
    "enabled": true,
    "defaultPriority": "medium",
    "priorities": ["low", "medium", "high", "critical"]
  }
}
```

### Color Schema Configuration

```json
// configs/color-schema/config.json
{
  "light": {
    "primary": "#1976d2",
    "secondary": "#dc004e",
    "background": "#f5f5f5",
    "surface": "#ffffff",
    "error": "#f44336",
    "warning": "#ff9800",
    "info": "#2196f3",
    "success": "#4caf50",
    "text": {
      "primary": "rgba(0, 0, 0, 0.87)",
      "secondary": "rgba(0, 0, 0, 0.54)",
      "disabled": "rgba(0, 0, 0, 0.38)",
      "hint": "rgba(0, 0, 0, 0.38)"
    }
  },
  "dark": {
    "primary": "#90caf9",
    "secondary": "#f48fb1",
    "background": "#121212",
    "surface": "#1e1e1e",
    "error": "#f44336",
    "warning": "#ff9800",
    "info": "#2196f3",
    "success": "#4caf50",
    "text": {
      "primary": "#ffffff",
      "secondary": "rgba(255, 255, 255, 0.7)",
      "disabled": "rgba(255, 255, 255, 0.5)",
      "hint": "rgba(255, 255, 255, 0.5)"
    }
  },
  "regional": {
    "saarland": {
      "primary": "#0066b3",
      "secondary": "#ffcc00",
      "accent": "#009036"
    }
  }
}
```

## Best Practices

1. **Never hardcode credentials** - Always use environment variables
2. **Validate configuration** - Always validate configuration against schemas
3. **Centralize configuration** - Use the configuration manager
4. **Use strong typing** - Define TypeScript interfaces for configuration
5. **Separate configuration by component** - Each component should have its own configuration
6. **Provide defaults** - Default values should be reasonable but secure
7. **Document configuration** - Document all configuration options
8. **Test configuration loading** - Write tests for configuration loading and validation

## Configuration Migration

When migrating from legacy configurations:

1. Define a migration plan
2. Create new configuration files based on the templates
3. Validate the new configuration
4. Update code to use the new configuration
5. Remove references to the old configuration

## Conclusion

Following these configuration standards ensures consistent, secure, and maintainable configuration across all agentland.saarland projects. Always use the configuration manager for accessing configuration and never hardcode sensitive information.

## Related Templates

| Template | Relationship |
|----------|--------------|
| [Structure](./template_structure.md) | Defines the directory structure where configuration files reside |
| [Security](./template_security.md) | Provides security guidelines for managing credentials and sensitive configuration |
| [Dashboard](./template_dashboard.md) | Uses configuration for color schemas and other UI settings |

## Changelog

- **1.0.0** (2025-05-16): Initial version based on the agentland.saarland project