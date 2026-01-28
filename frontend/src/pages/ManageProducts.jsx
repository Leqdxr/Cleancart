/**
 * Manage Products Admin Page Component
 * 
 * Admin interface for product catalog management:
 * - Add new products (form UI ready, backend integration pending)
 * - Remove products from catalog
 * - Product form fields: name, category, image URL
 * - Access control (admin only)
 * - Currently displays "Coming Soon" placeholder
 * - Products are managed via catalog.js file (hardcoded)
 * 
 * Note: This page has UI ready but backend integration is not yet implemented.
 * Products are currently managed through the static catalog.js data file.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ManageProducts.css';

function ManageProducts() {
  const { user, isAuthenticated } = useAuth();
  
  // State for product management (UI ready, backend pending)
  const [products, setProducts] = useState([]); // Will hold products when backend is connected
  const [showAddForm, setShowAddForm] = useState(false); // Toggle add product form
  const [newProduct, setNewProduct] = useState({ // New product form data
    name: '',
    category: '',
    image: ''
  });

  // Restrict access to admin users only
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="manage-products-container">
        <div className="card">
          <h2>Access Denied</h2>
          <p className="muted">You need admin privileges to access this page.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-products-container">
      <div className="manage-header">
        <div>
          <Link to="/admin" className="back-link">← Back to Admin</Link>
          <h1>Manage Products</h1>
          <p className="muted">Add new products or remove existing ones from the catalog</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-product-card">
          <h3>Add New Product</h3>
          <form className="product-form">
            <div className="form-field">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Category</label>
              <input
                type="text"
                placeholder="e.g., Dairy, Snacks, Beverages"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-placeholder">
        <div className="placeholder-icon">🛍️</div>
        <h2>Product Management Coming Soon</h2>
        <p className="muted">
          This feature will allow you to add, edit, and remove products from the catalog.
          Currently, products are managed through the catalog.js file.
        </p>
        <Link to="/products" className="btn btn-outline">
          View Current Products
        </Link>
      </div>
    </div>
  );
}

export default ManageProducts;
