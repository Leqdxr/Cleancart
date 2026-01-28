/**
 * Authentication Controller
 * Handles user registration, login, profile retrieval and updates
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

/**
 * Generate JWT authentication token
 * @param {number} userId - User's database ID
 * @returns {string} Signed JWT token valid for 7 days
 */
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * Request body:
 * - name: User's full name
 * - email: User's email address (must be unique)
 * - password: User's password (min 6 characters)
 * - confirmPassword: Password confirmation
 * 
 * Returns: JWT token and user object
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if email already exists in database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user (password will be hashed automatically by model hook)
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate authentication token
    const token = generateToken(user.id);

    // Return success response with token and user data (excluding password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: messages });
    }
    
    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Handle database connection errors
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      return res.status(500).json({ error: 'Database connection failed. Please check if PostgreSQL is running.' });
    }
    
    // Generic error handler with environment-specific messages
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Registration failed. Please try again.';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Authenticate user and generate login token
 * POST /api/auth/login
 * 
 * Request body:
 * - email: User's email address
 * - password: User's password
 * 
 * Special case: Creates admin account on first login with admin credentials
 * Admin credentials: admin@cleancart.com / admin1234
 * 
 * Returns: JWT token and user object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Special case: Auto-create admin user if logging in with admin credentials
    if ((email === 'admin@cleancart.com' || email === 'admin') && password === 'admin1234') {
      let user = await User.findOne({ where: { email: 'admin@cleancart.com' } });
      if (!user) {
        // Create admin user if doesn't exist
        user = await User.create({
          name: 'Admin',
          email: 'admin@cleancart.com',
          password: 'admin1234',
          role: 'admin'
        });
      }
      // Generate token and return admin user
      const token = generateToken(user.id);
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          role: user.role || 'admin'
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password using bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate authentication token
    const token = generateToken(user.id);

    // Return success response with token and user data
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle database connection errors
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      return res.status(500).json({ error: 'Database connection failed. Please check if PostgreSQL is running.' });
    }
    
    // Generic error handler with environment-specific messages
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Login failed. Please try again.';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get current authenticated user's profile
 * GET /api/auth/profile
 * Requires: Authentication (JWT token)
 * 
 * Returns: User object with profile information
 */
exports.getProfile = async (req, res) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;
    
    // Return user profile (excluding sensitive data like password)
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update current user's profile information
 * PUT /api/auth/profile
 * Requires: Authentication (JWT token)
 * 
 * Request body (all optional):
 * - name: Updated name
 * - profilePicture: Updated profile picture URL/base64
 * - currentPassword: Required if changing password
 * - newPassword: New password (requires currentPassword)
 * 
 * Returns: Updated user object
 */
exports.updateProfile = async (req, res) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;
    const { name, profilePicture, currentPassword, newPassword } = req.body;

    // Validate name if provided
    if (name && !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    // Handle password change if requested
    if (newPassword) {
      // Require current password for security
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      
      // Verify current password is correct
      const isCurrentValid = await user.comparePassword(currentPassword);
      if (!isCurrentValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      
      // Update password (will be hashed by model hook)
      user.password = newPassword;
    }

    // Update name if provided
    if (name) {
      user.name = name.trim();
    }

    // Update profile picture (can be set to empty string to remove)
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    // Save changes to database
    await user.save();

    // Return updated profile
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
