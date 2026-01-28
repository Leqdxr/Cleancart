/**
 * Admin authorization middleware
 * Verifies JWT token and checks for admin role
 * Protects routes that require admin privileges
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const User = require('../models/User');

/**
 * Middleware function to verify admin access
 * Authenticates user and verifies admin role
 * Returns 403 Forbidden if user is not an admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = async (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and has Bearer token format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user in database using decoded userId
    const user = await User.findByPk(decoded.userId);

    // Check if user exists in database
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify user has admin role
    // Checks both email (for demo admin@cleancart.com) and role field
    if (user.email !== 'admin@cleancart.com' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    
    // Continue to next middleware/route handler
    next();
  } catch (err) {
    console.error('Admin authentication error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = isAdmin;
