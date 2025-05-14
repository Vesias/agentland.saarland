/**
 * Schema loader utility for the web application
 */

const logger = require('../logging/logger').createLogger('schema-loader');

// Sample schemas
const schemas = {
  'profile/about-schema': {
    type: 'object',
    title: 'User Profile',
    properties: {
      userId: {
        type: 'string',
        title: 'User ID',
        readOnly: true
      },
      personal: {
        type: 'object',
        title: 'Personal Information',
        properties: {
          name: {
            type: 'string',
            title: 'Full Name'
          },
          email: {
            type: 'string',
            format: 'email',
            title: 'Email Address'
          },
          location: {
            type: 'string',
            title: 'Location'
          },
          bio: {
            type: 'string',
            title: 'Bio',
            maxLength: 500
          },
          skills: {
            type: 'array',
            title: 'Skills',
            items: {
              type: 'string'
            }
          }
        },
        required: ['name', 'email']
      },
      preferences: {
        type: 'object',
        title: 'Preferences',
        properties: {
          uiTheme: {
            type: 'string',
            title: 'UI Theme',
            enum: ['light', 'dark', 'system'],
            default: 'system'
          },
          colorScheme: {
            type: 'object',
            title: 'Color Scheme',
            properties: {
              primary: {
                type: 'string',
                format: 'color',
                title: 'Primary Color'
              },
              secondary: {
                type: 'string',
                format: 'color',
                title: 'Secondary Color'
              },
              accent: {
                type: 'string',
                format: 'color',
                title: 'Accent Color'
              }
            }
          },
          language: {
            type: 'string',
            title: 'Language',
            enum: ['en', 'de', 'fr'],
            default: 'de'
          },
          notifications: {
            type: 'boolean',
            title: 'Enable Notifications',
            default: true
          }
        }
      },
      agentSettings: {
        type: 'object',
        title: 'Agent Settings',
        properties: {
          isActive: {
            type: 'boolean',
            title: 'Active Status',
            default: true
          },
          missionPreferences: {
            type: 'array',
            title: 'Mission Preferences',
            items: {
              type: 'string',
              enum: ['local', 'regional', 'national', 'international']
            },
            default: ['local', 'regional']
          },
          skillLevel: {
            type: 'string',
            title: 'Skill Level',
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'beginner'
          }
        }
      }
    },
    required: ['personal']
  }
};

/**
 * Load a schema from the schemas store
 * @param {string} schemaName Name of the schema to load
 * @returns {Object} Schema object
 */
function loadSchema(schemaName) {
  logger.debug(`Loading schema: ${schemaName}`);
  
  if (!schemas[schemaName]) {
    logger.error(`Schema not found: ${schemaName}`);
    throw new Error(`Schema not found: ${schemaName}`);
  }
  
  return schemas[schemaName];
}

module.exports = {
  loadSchema
};