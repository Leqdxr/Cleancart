const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('cleancart', 'postgres', 'aagaman', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;
