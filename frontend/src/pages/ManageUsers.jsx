/**
 * Manage Users Admin Page Component
 * 
 * Admin interface for user management with:
 * - View all registered users in table format
 * - Edit user details (name, email, password, profile picture)
 * - Delete user accounts (with confirmation)
 * - Self-deletion prevention for current admin
 * - Inline editing UI
 * - Success/error message display
 * - Access control (admin only)
 * - Auto-refresh after changes
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/ManageUsers.css';

function ManageUsers() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState([]); // All users from backend
  const [loading, setLoading] = useState(true); // Initial fetch loading
  const [error, setError] = useState(''); // Error messages
  const [editingUser, setEditingUser] = useState(null); // Currently editing user ID
  const [editForm, setEditForm] = useState({ // Edit form data
    name: '',
    email: '',
    password: '',
    profilePicture: ''
  });
  const [saving, setSaving] = useState(false); // Save operation loading
  const [message, setMessage] = useState(''); // Success messages
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Delete confirmation state

  /**
   * Check authentication and fetch users on mount
   * Redirects non-admin users to home
   */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  /**
   * Fetch all users from backend
   * Handles authentication errors with logout
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      // Handle unauthorized access
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start editing a user
   * Populates form with current user data
   * @param {Object} userData - User object to edit
   */
  const handleEditClick = (userData) => {
    setEditingUser(userData.id);
    setEditForm({
      name: userData.name || '',
      email: userData.email || '',
      password: '', // Always start with empty password
      profilePicture: userData.profilePicture || ''
    });
    setError('');
    setMessage('');
  };

  /**
   * Cancel editing and reset form
   */
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', password: '', profilePicture: '' });
    setError('');
    setMessage('');
  };

  /**
   * Handle edit form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Save user changes to backend
   * Password is optional (only included if provided)
   * Refreshes user list after successful save
   */
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        profilePicture: editForm.profilePicture
      };

      // Only include password if provided
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const response = await api.put(`/admin/users/${editingUser}`, payload);
      setMessage('User updated successfully');
      setEditingUser(null);
      setEditForm({ name: '', email: '', password: '', profilePicture: '' });
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Update user error:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete user account
   * Calls backend API and refreshes user list
   * @param {number} userId - ID of user to delete
   */
  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.error || 'Failed to delete user');
      setDeleteConfirm(null);
    }
  };

  // Show loading state during initial fetch
  if (loading) {
    return (
      <div className="manage-users-container">
        <div className="loading-state">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <div className="manage-header">
        <div>
          <Link to="/admin" className="back-link">← Back to Admin</Link>
          <h1>Manage Users</h1>
          <p className="muted">Edit user details, reset passwords, and manage accounts</p>
        </div>
      </div>

      {(message || error) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
          {error || message}
        </div>
      )}

      <div className="users-grid">
        {users.map((userData, index) => (
          <div
            key={userData.id}
            className="user-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {editingUser === userData.id ? (
              <form onSubmit={handleSaveUser} className="edit-form">
                <div className="edit-header">
                  <h3>Editing {userData.name}</h3>
                  <button type="button" className="close-btn" onClick={handleCancelEdit}>×</button>
                </div>

                <div className="form-field">
                  <label>Profile Picture URL</label>
                  <input
                    type="url"
                    name="profilePicture"
                    value={editForm.profilePicture}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {editForm.profilePicture && (
                    <div className="avatar-preview-small">
                      <img src={editForm.profilePicture} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    required
                    placeholder="User name"
                  />
                </div>

                <div className="form-field">
                  <label>Email (Admin can change)</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    required
                    placeholder="user@example.com"
                  />
                  <p className="field-note">Only admins can change user emails</p>
                </div>

                <div className="form-field">
                  <label>New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                  <p className="field-note">Min 6 characters. Leave blank to keep unchanged.</p>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="user-avatar">
                  {userData.profilePicture ? (
                    <img src={userData.profilePicture} alt={userData.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{userData.name}</h3>
                  <p className="user-email">{userData.email}</p>
                  <p className="user-meta">
                    Joined {new Date(userData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="user-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleEditClick(userData)}
                  >
                    Edit User
                  </button>
                  {userData.email !== 'admin@cleancart.com' && (
                    <button
                      className="btn btn-text btn-danger"
                      onClick={() => setDeleteConfirm(userData.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteUser(deleteConfirm)}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
