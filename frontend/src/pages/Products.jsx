import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Products.css';

function Products() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="products-container">
        <div className="products-content login-required">
          <div className="login-required-card">
            <div className="lock-icon">🔒</div>
            <h1>Login Required</h1>
            <p>You must be logged in to view and add products to your cart.</p>
            <p className="login-required-subtitle">
              Please login or register to continue browsing our grocery products and comparing prices.
            </p>
            <div className="login-required-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-content">
        <h1>Products</h1>
        <p>Product comparison page coming soon...</p>
      </div>
    </div>
  );
}

export default Products;
