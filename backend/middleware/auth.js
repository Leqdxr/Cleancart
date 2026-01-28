/**
 * Authentication middleware
 * Verifies JWT token and attaches authenticated user to request object
 * Protects routes that require user authentication
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const User = require('../models/User');

/**
 * Middleware function to authenticate requests
 * Checks for valid JWT token in Authorization header
 * Attaches user object to req.user if valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
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

    // Check if user still exists in database
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    
    // Continue to next middleware/route handler
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
