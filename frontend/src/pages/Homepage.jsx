/**
 * Homepage Component
 * 
 * Landing page with:
 * - Hero section with value proposition
 * - Feature highlights (compare stores, smart cart, delivery clarity)
 * - Three-step process explanation
 * - Call-to-action sections
 * - Dynamic content based on authentication state
 * - Links to products, about, and registration pages
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Homepage.css';

function Homepage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-card card">
          <div className="pill">Compare smarter</div>
          <h1>
            Price your desk setup before you buy.
            <span className="hero-highlight"> One cart. Every store.</span>
          </h1>
          {!isAuthenticated && (
            <>
              <p>
                CleanCart checks keyboards, mice, headsets, docks and more across every partner store.
                See who has stock, delivery fees, and the lowest total before you check out.
              </p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary">Build my cart</Link>
                <Link to="/about" className="btn btn-outline">How it works</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="feature-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Built for builders, gamers, analysts</p>
            <h2>Transparent pricing. No guessing.</h2>
          </div>
          <Link to="/products" className="btn btn-outline">Browse catalog</Link>
        </div>
        <div className="feature-grid">
          <div className="feature-card card">
            <div className="feature-icon">🔍</div>
            <h3>Compare per store</h3>
            <p>See store-by-store prices, delivery fees, and whether an item is available before you add to cart.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">🛒</div>
            <h3>Smart cart math</h3>
            <p>We total your entire cart for each store, so bundles and accessories are already calculated.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon">🚚</div>
            <h3>Delivery clarity</h3>
            <p>Get store logos, ETA, and delivery charges up front. Out-of-stock items are clearly flagged.</p>
          </div>
        </div>
      </section>

      <section className="steps-section card">
        <div className="section-head">
          <p className="eyebrow">Three steps</p>
          <h2>From search to checkout</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-index">1</div>
            <div>
              <h3>Create your account</h3>
              <p>Register, log in, and unlock the product catalog with computer accessories.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-index">2</div>
            <div>
              <h3>Add items to cart</h3>
              <p>Pick mice, keyboards, headsets, docks, and monitors. We track availability per store.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-index">3</div>
            <div>
              <h3>Checkout and compare</h3>
              <p>See unique store totals, delivery fees, and stock visibility. Admin sees the order instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card card">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>Fast, clear, and reliable.</h2>
            <p>Start with a couple of accessories, compare every store, and check out with confidence.</p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary">Create account</Link>
            <Link to="/products" className="btn btn-outline">View products</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
