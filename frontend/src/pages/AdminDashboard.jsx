/**
 * Admin Dashboard Component
 * 
 * Central hub for admin operations with:
 * - Access control (admin role required)
 * - Three main sections:
 *   1. Manage Users - View/edit user accounts
 *   2. Manage Orders - Process customer orders (links to dashboard)
 *   3. Manage Products - Edit product catalog
 * - Visual menu cards with icons and descriptions
 * - Quick action links to products and profile
 * - Animated hover effects on menu cards
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState(null); // Currently unused, reserved for future tabs

  // Restrict access to admin users only
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="card admin-guest">
          <h2>Access Denied</h2>
          <p className="muted">You need admin privileges to access this page.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  /**
   * Admin menu options with routing and styling
   * Each card represents a major admin function
   */
  const menuOptions = [
    {
      id: 'users',
      icon: '👥',
      title: 'Manage Users',
      description: 'View and edit user accounts',
      color: '#3b82f6', // Blue
      path: '/admin/users'
    },
    {
      id: 'orders',
      icon: '📦',
      title: 'Manage Orders',
      description: 'Process and track customer orders',
      color: '#10b981', // Green
      path: '/dashboard'
    },
    {
      id: 'products',
      icon: '🛍️',
      title: 'Manage Products',
      description: 'Add or remove product catalog',
      color: '#f59e0b', // Amber
      path: '/admin/products'
    }
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin Control Panel</p>
          <h1>Hello, {user?.name}</h1>
          <p className="muted">Choose a management section to continue</p>
        </div>
      </div>

      <div className="admin-menu-grid">
        {menuOptions.map((option, index) => (
          <Link
            key={option.id}
            to={option.path}
            className="admin-menu-card"
            style={{
              '--card-color': option.color,
              animationDelay: `${index * 0.1}s`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <div className="card-icon">{option.icon}</div>
            <h3>{option.title}</h3>
            <p className="muted">{option.description}</p>
            <div className="card-arrow">→</div>
          </Link>
        ))}
      </div>

      <div className="admin-stats">
        <div className="stat-item">
          <span className="stat-label">Quick Actions</span>
          <div className="quick-actions">
            <Link to="/products" className="btn btn-outline">Browse Products</Link>
            <Link to="/profile" className="btn btn-outline">My Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
