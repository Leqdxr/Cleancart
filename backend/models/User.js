/**
 * User Model
 * Defines the User schema for database and includes password hashing
 * Uses Sequelize ORM for PostgreSQL database interaction
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * User model definition with all fields and validation rules
 */
const User = sequelize.define('User', {
  // Primary key - auto-incrementing integer
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // User's full name
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true // Name cannot be empty string
    }
  },
  
  // User's email address - must be unique and valid email format
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures no duplicate emails in database
    validate: {
      isEmail: true, // Validates email format
      notEmpty: true
    }
  },
  
  // Profile picture URL or base64 data
  profilePicture: {
    type: DataTypes.TEXT,
    allowNull: true // Optional field
  },
  
  // User role for access control (user/admin)
  role: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'user' // Default to regular user
  },
  
  // Hashed password - never stored in plain text
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100], // Password must be 6-100 characters
      notEmpty: true
    }
  }
}, {
  tableName: 'users', // Database table name
  
  // Lifecycle hooks for password hashing
  hooks: {
    // Hash password before creating new user
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    
    // Hash password before updating user if password changed
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

/**
 * Instance method to verify password
 * Compares plain text password with hashed password
 * 
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
