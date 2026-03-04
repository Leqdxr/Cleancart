import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
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
    <div className="forgot-container">
      <div className="forgot-split">
        {/* Left: Image Panel */}
        <div className="forgot-image-panel">
          <img src="/images/login.jpg" alt="Reset your password" className="forgot-cover-img" />
          <div className="forgot-image-overlay">
            <h2>Reset Password</h2>
            <p>Don't worry — we'll help you get back into your account.</p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="forgot-form-panel">
          <div className="forgot-card">
            <Link to="/login" className="back-button">← Back to Login</Link>
            <div className="forgot-brand">
              <img src="/images/logo.png" alt="CleanCart" className="forgot-logo" />
              <span>CleanCart</span>
            </div>

            {!success ? (
              <>
                <h1>Forgot Password</h1>
                <p className="forgot-sub">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="forgot-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                      placeholder="Enter your email"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
                <p className="login-link">
                  Remember your password? <Link to="/login">Sign in</Link>
                </p>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h1>Check Your Email</h1>
                <p className="forgot-sub">
                  If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly. Please check your inbox and spam folder.
                </p>
                <p className="forgot-sub" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  The link will expire in 20 minutes.
                </p>
                <Link to="/login" className="submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1.5rem' }}>
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
