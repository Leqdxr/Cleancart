/**
 * Admin Routes
 * Handles user management operations (CRUD)
 * All routes require admin authentication
 * Base path: /api/admin
 */

const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/adminController');
const isAdmin = require('../middleware/isAdmin');

// Apply admin authentication middleware to all routes
// Only users with admin role can access these endpoints
router.use(isAdmin);

// GET /api/admin/users - Retrieve all users from database
router.get('/users', getAllUsers);

// GET /api/admin/users/:id - Retrieve specific user by ID
router.get('/users/:id', getUserById);

// PUT /api/admin/users/:id - Update user information (name, email, role, etc.)
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id - Delete user from database
router.delete('/users/:id', deleteUser);

module.exports = router;
