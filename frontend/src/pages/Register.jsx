import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    return strength;
  };

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
  };

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation - check password strength
    const strength = getPasswordStrength(formData.password);
    if (strength < 4) {
      setError('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 symbol');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      
      // Show success message
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setPasswordStrength(0);
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle network errors (backend not running)
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000.');
      } else {
        // Show the specific error message from the backend
        setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <Link to="/" className="back-button">← Back</Link>
        <h1>Create your account</h1>
        <h2>Access the catalog</h2>
        {success && <div className="success-message">Registration successful! You may now login.</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              disabled={success}
            />
          </div>
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
              disabled={success}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              disabled={success}
            />
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              disabled={success}
            />
          </div>
          {!success && (
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          )}
          <p className="login-link">
            {success ? (
              <>
                Already have an account? <Link to="/login">Login here</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Login here</Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
