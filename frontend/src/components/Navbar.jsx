import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Cleancart
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/products" className="navbar-link">Products</Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">About Us</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <div className="navbar-user">
                  <span className="user-icon">👤</span>
                  <span className="user-name">{user?.name || 'User'}</span>
                </div>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link navbar-login">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link navbar-register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
