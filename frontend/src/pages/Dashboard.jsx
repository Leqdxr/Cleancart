import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p className="dashboard-subtitle">You're successfully logged in to Cleancart</p>
        
        <div className="dashboard-cards">
          <Link to="/products" className="dashboard-card">
            <div className="card-icon">🛒</div>
            <h2>Browse Products</h2>
            <p>View and compare grocery prices from different stores</p>
          </Link>
          
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h2>Price Comparison</h2>
            <p>Compare prices and find the best deals</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-icon">🛍️</div>
            <h2>My Cart</h2>
            <p>Manage your shopping cart</p>
          </div>
        </div>

        <div className="dashboard-info">
          <h3>Get Started</h3>
          <p>Start by browsing products and adding items to your cart to compare prices across different stores.</p>
          <Link to="/products" className="btn-primary">Go to Products</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
