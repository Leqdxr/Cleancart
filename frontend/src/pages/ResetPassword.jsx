import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#22c55e' };
  };

  const strength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-split">
        {/* Left: Image Panel */}
        <div className="reset-image-panel">
          <img src="/images/login.jpg" alt="Reset your password" className="reset-cover-img" />
          <div className="reset-image-overlay">
            <h2>New Password</h2>
            <p>Create a strong, secure password for your account.</p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="reset-form-panel">
          <div className="reset-card">
            <Link to="/login" className="back-button">← Back to Login</Link>
            <div className="reset-brand">
              <img src="/images/logo.png" alt="CleanCart" className="reset-logo" />
              <span>CleanCart</span>
            </div>

            {!success ? (
              <>
                <h1>Reset Password</h1>
                <p className="reset-sub">Enter your new password below. Make sure it's at least 6 characters.</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="reset-form">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        placeholder="Enter new password"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.06 18.06 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {formData.newPassword && (
                      <div className="password-strength">
                        <div className="strength-bars">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`strength-bar ${i <= strength.level ? 'active' : ''}`}
                              style={{ backgroundColor: i <= strength.level ? strength.color : undefined }}
                            />
                          ))}
                        </div>
                        <span className="strength-label" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-wrap">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.06 18.06 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <span className="mismatch-hint">Passwords do not match</span>
                    )}
                    {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.confirmPassword.length >= 6 && (
                      <span className="match-hint">Passwords match!</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading || formData.newPassword.length < 6 || formData.newPassword !== formData.confirmPassword}
                  >
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h1>Password Reset!</h1>
                <p className="reset-sub">
                  Your password has been successfully changed. You can now log in with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="submit-btn"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
