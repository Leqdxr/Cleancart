import '../styles/About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Cleancart</h1>
        <div className="about-intro">
          <p className="intro-text">
            Clean Cart is built as a price comparison and decision support system for grocery shopping. 
            Our application helps you make smarter shopping decisions by comparing prices across different stores.
          </p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <div className="about-features">
            <div className="about-feature">
              <div className="feature-number">1</div>
              <div className="feature-text">
                <h3>Browse & View</h3>
                <p>Browse grocery items and view prices from different stores all in one place.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="feature-number">2</div>
              <div className="feature-text">
                <h3>Build Your Cart</h3>
                <p>Add items to your cart as you browse through the available products.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="feature-number">3</div>
              <div className="feature-text">
                <h3>Smart Calculation</h3>
                <p>Our backend processes your cart and calculates the total cost per store using stored price data.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="feature-number">4</div>
              <div className="feature-text">
                <h3>Clear Comparison</h3>
                <p>View a detailed comparison table showing price differences and identify the cheapest store for your entire cart.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p className="mission-text">
            Clean Cart makes it easy for users to understand how store choice impacts total spending. 
            The application highlights the cheapest store and displays clear comparisons, helping you save money 
            on every grocery shopping trip.
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
