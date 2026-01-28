/**
 * Database configuration file
 * Initializes Sequelize ORM connection to PostgreSQL database
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Create Sequelize instance with database credentials
 * Database: cleancart
 * User: postgres
 * Password: aagaman
 * Host: localhost
 * Dialect: PostgreSQL
 */
const sequelize = new Sequelize('cleancart', 'postgres', 'aagaman', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries in console
});

/**
 * Test database connection on startup
 * Verifies that PostgreSQL is running and credentials are correct
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

// Run connection test
testConnection();

// Export sequelize instance for use in models and controllers
module.exports = sequelize;
