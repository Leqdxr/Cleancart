/**
 * Navbar Component
 *
 * Persistent navigation bar displayed at the top of every page
 * Features:
 * - Brand logo linking to homepage
 * - Navigation links (Home, Products, About, Dashboard/Admin)
 * - Theme toggle (light/dark mode)
 * - Notification bell with dropdown (unread badge)
 * - User profile button with avatar
 * - Login/Register buttons for unauthenticated users
 * - Responsive layout with sticky positioning
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import '../styles/Navbar.css';

function Navbar() {
  // Auth state and methods
  const { isAuthenticated, user, logout } = useAuth();
  // Theme toggle for dark/light mode
  const { theme, toggleTheme } = useTheme();
  // Notification state and methods
  const { getNotificationsForUser, getUnreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Notification dropdown visibility state
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  // Ref for click-outside detection on notification dropdown
  const notifRef = useRef(null);

  // Get notifications and unread count for the current user
  const userNotifs = isAuthenticated ? getNotificationsForUser(user?.id, user?.email) : [];
  const unreadCount = isAuthenticated ? getUnreadCount(user?.id, user?.email) : 0;

  // Close notification dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Handle user logout — clear auth state and redirect to home */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /** Navigate to user profile page */
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Determine if current user is admin for conditional rendering
  const isAdmin = user?.role === 'admin';
  // Get user's profile picture for avatar display
  const avatar = user?.profilePicture;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/images/logo.png" alt="CleanCart" className="logo-img" />
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
            {isAuthenticated && !isAdmin && (
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
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="notif-wrapper" ref={notifRef}>
                  <button
                    className="notif-bell-btn"
                    onClick={() => setShowNotifDropdown((v) => !v)}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>

                  {showNotifDropdown && (
                    <div className="notif-dropdown">
                      <div className="notif-dropdown-header">
                        <span className="notif-dropdown-title">Notifications</span>
                        {unreadCount > 0 && (
                          <button className="notif-mark-all" onClick={() => markAllAsRead(user?.id, user?.email)}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="notif-dropdown-list">
                        {userNotifs.length === 0 ? (
                          <div className="notif-empty">No notifications yet</div>
                        ) : (
                          userNotifs.slice(0, 20).map((notif) => (
                            <div
                              key={notif.id}
                              className={`notif-item ${notif.read ? '' : 'notif-unread'}`}
                              onClick={() => markAsRead(notif.id)}
                            >
                              <span className="notif-item-icon">{notif.icon}</span>
                              <div className="notif-item-body">
                                <span className="notif-item-title">{notif.title}</span>
                                <span className="notif-item-msg">{notif.message}</span>
                                <span className="notif-item-time">
                                  {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
