/**
 * User Profile Page Component
 * 
 * Provides user profile management with two main sections:
 * 1. Account Details - Update name and profile picture
 * 2. Password Change - Update password with current password verification
 * 
 * Features:
 * - Profile picture upload (file or URL)
 * - Email display (locked, cannot be changed)
 * - Password strength indicator for new passwords
 * - Real-time validation of password requirements
 * - Success/error message display
 * - Auto-logout on 401 errors
 * - Loading state during profile fetch
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const { isAuthenticated, updateUser, user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form state (name, email, picture)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: ''
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0); // Password strength (0-4)
  const [loading, setLoading] = useState(true); // Initial profile load
  const [savingProfile, setSavingProfile] = useState(false); // Profile save loading
  const [savingPassword, setSavingPassword] = useState(false); // Password save loading
  const [message, setMessage] = useState(''); // Success message
  const [error, setError] = useState(''); // Error message

  /**
   * Fetch user profile on mount
   * Redirects to login if not authenticated
   * Updates local state and context with fetched data
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const fetchedUser = response.data.user;
        setProfile({
          name: fetchedUser.name || '',
          email: fetchedUser.email || '',
          profilePicture: fetchedUser.profilePicture || ''
        });
        updateUser(fetchedUser); // Update context with latest data
      } catch (err) {
        console.error('Profile fetch error:', err);
        // Handle authentication errors
        if (err?.response?.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  /**
   * Calculate password strength score (0-4)
   * Checks for: length (8+), uppercase, number, symbol
   * @param {string} pwd - Password to evaluate
   * @returns {number} Strength score 0-4
   */
  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd)) strength++;
    return strength;
  };

  /**
   * Individual password requirement checks
   * Used to show checkmarks for each requirement
   */
  const passwordChecks = {
    length: passwordForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(passwordForm.newPassword)
  };

  /**
   * Handle profile input changes (name, email, picture URL)
   * Clears messages when user types
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  /**
   * Handle profile picture file upload
   * Converts file to base64 data URL for storage
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, profilePicture: reader.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle password form input changes
   * Recalculates strength when new password changes
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      setPasswordStrength(getPasswordStrength(value));
    }
    setError('');
    setMessage('');
  };

  /**
   * Save profile changes (name and profile picture)
   * Email is locked and cannot be changed
   */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: profile.name,
        profilePicture: profile.profilePicture
      };
      const response = await api.put('/auth/profile', payload);
      const updatedUser = response.data.user;
      // Update local state with server response
      setProfile({
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || ''
      });
      updateUser(updatedUser); // Update context
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error('Profile save error:', err);
      if (err?.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  /**
   * Update user password
   * Requires current password verification
   * Validates new password strength (must be 4/4)
   * Verifies new password and confirmation match
   */
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setError('');
    setMessage('');

    // Verify password confirmation matches
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSavingPassword(false);
      setError('New password and confirmation must match');
      return;
    }

    // Validate password strength (must be 4/4 - all requirements met)
    const strength = getPasswordStrength(passwordForm.newPassword);
    if (strength < 4) {
      setSavingPassword(false);
      setError('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 symbol');
      return;
    }

    try {
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };
      const response = await api.put('/auth/profile', payload);
      updateUser(response.data.user);
      setMessage('Password updated successfully');
      // Clear password form after successful update
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength(0);
    } catch (err) {
      console.error('Password update error:', err);
      if (err?.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Use profile picture from state or fallback to context user
  const currentAvatar = profile.profilePicture || user?.profilePicture;

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-wrap">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Profile" className="avatar" />
          ) : (
            <div className="avatar placeholder">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
          )}
        </div>
        <div>
          <h1>Profile</h1>
          <p className="muted">Customize how you show up in Clean Cart</p>
        </div>
      </div>

      {(message || error) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
          {error || message}
        </div>
      )}

      <div className="profile-grid">
        <form className="profile-card" onSubmit={handleProfileSave}>
          <div className="card-header">
            <div>
              <h3>Account details</h3>
              <p className="muted small">Update your name and profile picture. Email stays locked.</p>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>

          <div className="field-group">
            <label className="label" htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={profile.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              aria-disabled
            />
            <p className="muted small">Email is locked to protect your account.</p>
          </div>

          <div className="field-group">
            <label className="label">Profile picture</label>
            <div className="avatar-controls">
              <div className="avatar-preview">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Profile preview" />
                ) : (
                  <div className="avatar placeholder">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
                )}
              </div>
              <div className="avatar-actions">
                <label className="upload-btn">
                  Upload image
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
                <input
                  type="url"
                  placeholder="Or paste an image URL"
                  value={profile.profilePicture}
                  onChange={(e) => setProfile((prev) => ({ ...prev, profilePicture: e.target.value }))}
                />
                {profile.profilePicture && (
                  <button type="button" className="link-btn" onClick={() => setProfile((prev) => ({ ...prev, profilePicture: '' }))}>
                    Remove picture
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        <form className="profile-card" onSubmit={handlePasswordSave}>
          <div className="card-header">
            <div>
              <h3>Password</h3>
              <p className="muted small">Change your password. Email remains unchanged.</p>
            </div>
            <button type="submit" className="btn btn-outline" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label className="label" htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="field-group">
              <label className="label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter new password"
              />
              {passwordForm.newPassword && (
                <>
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${passwordStrength}`} />
                  </div>
                  <p className={`strength-text strength-text-${passwordStrength}`}>
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Weak'}
                    {passwordStrength === 3 && 'Medium'}
                    {passwordStrength === 4 && 'Strong'}
                  </p>
                  <div className="password-checks">
                    <div className={`check-item ${passwordChecks.length ? 'pass' : ''}`}>
                      <span className="check-icon">✓</span> At least 8 characters
                    </div>
                    <div className={`check-item ${passwordChecks.uppercase ? 'pass' : ''}`}>
                      <span className="check-icon">✓</span> At least 1 capital letter
                    </div>
                    <div className={`check-item ${passwordChecks.number ? 'pass' : ''}`}>
                      <span className="check-icon">✓</span> At least 1 number
                    </div>
                    <div className={`check-item ${passwordChecks.symbol ? 'pass' : ''}`}>
                      <span className="check-icon">✓</span> At least 1 symbol (!@#$% etc)
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="field-group">
              <label className="label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Re-enter new password"
              />
            </div>
          </div>
          <p className="muted small">Password updates require your current password for security.</p>
        </form>
      </div>
    </div>
  );
}

export default Profile;
