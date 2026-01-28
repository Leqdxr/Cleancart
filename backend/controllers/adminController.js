/**
 * Admin Controller
 * Handles user management operations for administrators
 * All functions require admin authentication
 */

const User = require('../models/User');

/**
 * Get all users from database
 * GET /api/admin/users
 * Requires: Admin authentication
 * 
 * Returns: Array of all users (excluding passwords)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users but exclude password field for security
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'profilePicture', 'createdAt', 'updatedAt']
    });
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get specific user by ID
 * GET /api/admin/users/:id
 * Requires: Admin authentication
 * 
 * URL params:
 * - id: User ID to retrieve
 * 
 * Returns: User object (excluding password)
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by primary key, excluding password
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'profilePicture', 'createdAt', 'updatedAt']
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Update user information (admin function)
 * PUT /api/admin/users/:id
 * Requires: Admin authentication
 * 
 * URL params:
 * - id: User ID to update
 * 
 * Request body (all optional):
 * - name: Updated name
 * - email: Updated email (must be unique)
 * - password: New password
 * - profilePicture: Updated profile picture
 * 
 * Returns: Updated user object
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, profilePicture } = req.body;

    // Find user to update
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate and update email if provided
    if (email && email !== user.email) {
      // Check if new email is already in use
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
      user.email = email;
    }

    // Update name if provided and not empty
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update password if provided (with validation)
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      user.password = password; // Will be hashed by model hook
    }

    // Update profile picture (can be cleared with empty string)
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    // Save changes to database
    await user.save();

    // Return updated user data
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete user from database
 * DELETE /api/admin/users/:id
 * Requires: Admin authentication
 * 
 * URL params:
 * - id: User ID to delete
 * 
 * Security: Prevents admin from deleting themselves
 * 
 * Returns: Success message
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user to delete
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting their own account
    if (req.user.id === user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Permanently delete user from database
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
