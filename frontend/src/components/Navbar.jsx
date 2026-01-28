/**
 * Navigation Bar Component
 * 
 * Provides application-wide navigation with role-based menu items
 * - Public links: Home, Products, About
 * - Authenticated links: Dashboard
 * - Admin links: Admin panel
 * - User actions: Login/Register or Profile/Logout
 * - Active route highlighting
 * - Profile picture or role-based icons
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  // Get authentication state and user info from context
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Track current route for active highlighting

  /**
   * Handle user logout
   * Clears authentication and redirects to homepage
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Navigate to user profile page
   */
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Check if current user has admin role
  const isAdmin = user?.role === 'admin';
  // Get user's profile picture
  const avatar = user?.profilePicture;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">◎</span>
          <span>CleanCart</span>
        </Link>

        <div className="navbar-actions">
          <ul className="navbar-menu">
            <li className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}>
              <Link to="/" className="navbar-link">Home</Link>
            </li>
            <li className={`navbar-item ${location.pathname === '/products' ? 'active' : ''}`}>
              <Link to="/products" className="navbar-link">Products</Link>
            </li>
            <li className={`navbar-item ${location.pathname === '/about' ? 'active' : ''}`}>
              <Link to="/about" className="navbar-link">About</Link>
            </li>
            {isAuthenticated && (
              <li className={`navbar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li className={`navbar-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                <Link to="/admin" className="navbar-link">Admin</Link>
              </li>
            )}
          </ul>

          <div className="navbar-cta">
            {isAuthenticated ? (
              <>
                <button type="button" className="navbar-user" onClick={handleProfileClick}>
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="user-avatar" />
                  ) : (
                    <span className="user-icon">{isAdmin ? '🛡️' : '👤'}</span>
                  )}
                  <span className="user-name">{user?.name || 'User'}</span>
                </button>
                <button onClick={handleLogout} className="btn btn-outline logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
