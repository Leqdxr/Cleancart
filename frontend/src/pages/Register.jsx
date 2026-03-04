/**
 * Register Page Component
 *
 * New user registration page with:
 * - Split layout (image panel + form panel)
 * - Full name, email, password, and confirm password fields
 * - Password strength indicator (Weak/Medium/Strong)
 * - Real-time password requirement checklist
 * - Show/hide password toggles
 * - Auto-redirect if already authenticated
 * - Success message with link to login
 * - Server connection error handling
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

/** SVG icon for visible password (eye open) */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
/** SVG icon for hidden password (eye with slash) */
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.06 18.06 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function Register() {
  // Form field state
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  // Error and success message states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // API loading state
  const [loading, setLoading] = useState(false);
  // Password strength score (0–4)
  const [passwordStrength, setPasswordStrength] = useState(0);
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Calculate password strength score
   * Checks length (8+), uppercase, number, and symbol
   * @param {string} pwd - Password to evaluate
   * @returns {number} Score from 0–4
   */
  const getPasswordStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) s++;
    return s;
  };

  // Individual password requirement checks for UI checkmarks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  /** Handle form input changes and recalculate password strength */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') setPasswordStrength(getPasswordStrength(value));
    setError('');
  };

  /**
   * Handle registration form submission
   * Validates password strength and match before sending to backend
   * Resets form on success, shows error on failure
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (getPasswordStrength(formData.password) < 4) {
      setError('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 symbol');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setPasswordStrength(0);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-split">
        {/* Left: Image Panel */}
        <div className="register-image-panel">
          <img src="/images/register.jpg" alt="Join CleanCart" className="register-cover-img" />
          <div className="register-image-overlay">
            <h2>Join CleanCart</h2>
            <p>Create your account and start comparing store prices instantly.</p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="register-form-panel">
          <div className="register-card">
            <Link to="/" className="back-button">← Back</Link>
            <div className="login-brand">
              <img src="/images/logo.png" alt="CleanCart" className="login-logo" />
              <span>CleanCart</span>
            </div>
            <h1>Create account</h1>
            <p className="login-sub">Join CleanCart and start comparing store prices.</p>
            {success && <div className="success-message">🎉 Registration successful! You may now <Link to="/login">login</Link>.</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" disabled={success} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" disabled={success} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" disabled={success} />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label="Toggle password">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {formData.password && (
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
                      <div className={`check-item ${passwordChecks.length ? 'pass' : ''}`}><span className="check-icon">✓</span> At least 8 characters</div>
                      <div className={`check-item ${passwordChecks.uppercase ? 'pass' : ''}`}><span className="check-icon">✓</span> At least 1 capital letter</div>
                      <div className={`check-item ${passwordChecks.number ? 'pass' : ''}`}><span className="check-icon">✓</span> At least 1 number</div>
                      <div className={`check-item ${passwordChecks.symbol ? 'pass' : ''}`}><span className="check-icon">✓</span> At least 1 symbol</div>
                    </div>
                  </>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrap">
                  <input type={showConfirm ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" disabled={success} />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              {!success && (
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Registering…' : 'Create Account'}
                </button>
              )}
              <p className="login-link">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
