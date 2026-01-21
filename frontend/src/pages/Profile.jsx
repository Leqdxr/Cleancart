import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const { isAuthenticated, updateUser, user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        updateUser(fetchedUser);
      } catch (err) {
        console.error('Profile fetch error:', err);
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

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd)) strength++;
    return strength;
  };

  const passwordChecks = {
    length: passwordForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(passwordForm.newPassword)
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, profilePicture: reader.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      setPasswordStrength(getPasswordStrength(value));
    }
    setError('');
    setMessage('');
  };

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
      setProfile({
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || ''
      });
      updateUser(updatedUser);
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

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSavingPassword(false);
      setError('New password and confirmation must match');
      return;
    }

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
