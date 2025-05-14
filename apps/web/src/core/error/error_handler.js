/**
 * Error handler module for the web application
 */

const logger = require('../logging/logger').createLogger('error-handler');

/**
 * Handle an error with a specific error code
 * @param {string} errorCode The error code
 * @param {Error} error The error object
 * @returns {Error} The error object
 */
function handleError(errorCode, error) {
  logger.error(`Error handled: ${errorCode}`, { error });
  
  // You can add custom error handling logic here
  // For example, sending errors to a monitoring service
  
  return error;
}

module.exports = {
  handleError
};