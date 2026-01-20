import { Link } from 'react-router-dom';
import '../styles/Homepage.css';

function Homepage() {
  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find the Best Prices with Cleancart</h1>
          <p className="hero-subtitle">
            Compare grocery prices across different stores in one place. 
            Save time and money with our smart price comparison tool for grocery shopping.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Explore Products</Link>
            <Link to="/register" className="btn btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Cleancart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Comparison</h3>
              <p>Compare grocery prices from different stores instantly in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Save Money</h3>
              <p>Find the cheapest store for your entire cart and maximize your savings.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Smart Cart Analysis</h3>
              <p>Add items to your cart and see total costs calculated per store automatically.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Clear Comparison</h3>
              <p>View detailed comparison tables showing price differences and the best store choice.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Saving?</h2>
          <p>Join Cleancart today and start comparing prices like a pro!</p>
          <Link to="/register" className="btn btn-primary btn-large">Sign Up Now</Link>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
