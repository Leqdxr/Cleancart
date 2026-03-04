/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 * Base path: /api/auth
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const authenticate = require('../middleware/auth');

// POST /api/auth/register - Create new user account
router.post('/register', register);

// POST /api/auth/login - Authenticate user and return JWT token
router.post('/login', login);

// POST /api/auth/forgot-password - Request password reset email
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

// GET /api/auth/profile - Get current authenticated user's profile
// Requires authentication via JWT token
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile - Update current user's profile (name, password, picture)
// Requires authentication via JWT token
router.put('/profile', authenticate, updateProfile);

module.exports = router;
