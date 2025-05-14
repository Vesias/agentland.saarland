/**
 * Simple logger module for the web application
 */

/**
 * Create a logger instance
 * @param {string} context The context for logging
 * @returns {Object} Logger object with debug, info, warn, and error methods
 */
function createLogger(context) {
  const log = (level, message, data = {}) => {
    console[level](`[${context}] ${message}`, data);
  };

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('log', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data)
  };
}

module.exports = {
  createLogger
};