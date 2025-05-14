/**
 * Configuration manager for the web application
 */

// Configuration types
const CONFIG_TYPES = {
  COLOR_SCHEMA: 'color-schema',
  MCP: 'mcp',
  PROFILE: 'profile',
  SECURITY: 'security'
};

// Default configurations
const defaultConfigs = {
  [CONFIG_TYPES.COLOR_SCHEMA]: {
    themes: {
      light: {
        colors: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#8b5cf6',
          background: '#ffffff',
          surface: '#f3f4f6',
          text: '#1f2937',
          textSecondary: '#4b5563',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          shadow: 'rgba(0, 0, 0, 0.1)'
        }
      },
      dark: {
        colors: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#8b5cf6',
          background: '#1f2937',
          surface: '#374151',
          text: '#f3f4f6',
          textSecondary: '#d1d5db',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          shadow: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
    userPreferences: {
      activeTheme: 'light'
    }
  },
  [CONFIG_TYPES.MCP]: {
    servers: [
      {
        id: 'context7',
        url: 'http://localhost:3000/api/context7',
        enabled: true,
        running: false
      }
    ],
    profileModel: 'claude-3-sonnet-20240229'
  },
  [CONFIG_TYPES.PROFILE]: {
    schemaPath: 'profile/about-schema'
  }
};

// In-memory store for configuration
let configStore = { ...defaultConfigs };

/**
 * Get configuration for a specific type
 * @param {string} type Configuration type
 * @returns {Object} Configuration object
 */
function getConfig(type) {
  return configStore[type] || defaultConfigs[type] || {};
}

/**
 * Get a specific configuration value
 * @param {string} type Configuration type
 * @param {string} key Configuration key
 * @param {*} defaultValue Default value if not found
 * @returns {*} Configuration value
 */
function getConfigValue(type, key, defaultValue = null) {
  const config = getConfig(type);
  return key in config ? config[key] : defaultValue;
}

/**
 * Set configuration for a specific type
 * @param {string} type Configuration type
 * @param {Object} config Configuration object
 */
function setConfig(type, config) {
  configStore[type] = config;
}

module.exports = {
  CONFIG_TYPES,
  getConfig,
  getConfigValue,
  setConfig
};