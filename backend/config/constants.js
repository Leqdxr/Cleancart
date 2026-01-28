/**
 * Application constants and configuration
 * Stores sensitive keys and configuration values
 */

// JWT Secret key for signing and verifying authentication tokens
// Uses environment variable if available, otherwise falls back to default
// NOTE: Change this secret key in production for security
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Export constants for use throughout the application
module.exports = {
  JWT_SECRET
};
