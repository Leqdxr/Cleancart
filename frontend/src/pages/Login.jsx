import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import '../styles/Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      login({ ...user, role: user?.role || 'user' }, token);
      setWelcomeName(user?.name || 'there');
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        navigate('/dashboard');
      }, 2600);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <div className="welcome-check">✓</div>
            <h2 className="welcome-title">Welcome back, {welcomeName}!</h2>
            <p className="welcome-sub">Redirecting you to your dashboard…</p>
            <div className="welcome-bar"><div className="welcome-bar-fill" /></div>
          </div>
        </div>
      )}

      <div className="login-container">
        <div className="login-card">
          <Link to="/" className="back-button">← Back</Link>
          <div className="login-brand">
            <img src="/images/logo.png" alt="CleanCart" className="login-logo" />
            <span>CleanCart</span>
          </div>
          <h1>Welcome back</h1>
          <p className="login-sub">Sign in to compare prices and manage your orders.</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
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
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
            <p className="register-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
