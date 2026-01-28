/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 * Base path: /api/auth
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// POST /api/auth/register - Create new user account
router.post('/register', register);

// POST /api/auth/login - Authenticate user and return JWT token
router.post('/login', login);

// GET /api/auth/profile - Get current authenticated user's profile
// Requires authentication via JWT token
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile - Update current user's profile (name, password, picture)
// Requires authentication via JWT token
router.put('/profile', authenticate, updateProfile);

module.exports = router;
