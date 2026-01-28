/**
 * About Page Component
 * 
 * Informational page explaining CleanCart's purpose and features:
 * - Product: Price comparison system for computer accessories
 * - How It Works: 4-step process explanation
 * - Mission: Making multi-store price comparison easy
 * - Values: Simplicity, Usability, Clarity
 * - Static content, no authentication required
 */

import '../styles/About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About CleanCart</h1>
        <div className="about-intro">
          <p className="intro-text">
            CleanCart is a price comparison and decision support system for computer accessories. 
            Add keyboards, mice, headsets, docks, and monitors to one cart and see every store's total instantly.
          </p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <div className="about-features">
            <div className="about-feature">
              <div className="feature-number">1</div>
              <div className="feature-text">
                <h3>Browse & View</h3>
                <p>Browse tech accessories and view store-level pricing and delivery fees side by side.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="feature-number">2</div>
              <div className="feature-text">
                <h3>Build Your Cart</h3>
                <p>Add items to your cart and we keep availability and store totals up to date.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="feature-number">3</div>
              <div className="feature-text">
                <h3>Smart Calculation</h3>
                <p>We calculate full-cart totals per store, including delivery, so bundles stay accurate.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="feature-number">4</div>
              <div className="feature-text">
                <h3>Clear Comparison</h3>
                <p>See availability, store logos, and delivery charges before you checkout and send it to admin.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p className="mission-text">
            CleanCart makes it easy to understand how store choice changes the total price of your desk setup. 
            We highlight the cheapest store, flag out-of-stock items, and keep admins in control of every checkout.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Simplicity</h3>
              <p>An intuitive interface that makes price comparison effortless.</p>
            </div>
            <div className="value-card">
              <h3>Usability</h3>
              <p>Designed with the user in mind for a seamless shopping experience.</p>
            </div>
            <div className="value-card">
              <h3>Clarity</h3>
              <p>Clear, transparent comparisons that help you make informed decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
