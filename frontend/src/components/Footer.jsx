import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand / About */}
          <div className="footer-col footer-brand-col">
            <Link to="/" className="footer-logo">
              <img src="/images/logo.png" alt="CleanCart" className="footer-logo-img" />
              <span>CleanCart</span>
            </Link>
            <p className="footer-about">
              Compare prices across stores, find the best deals on computer accessories, and checkout with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <span className="footer-contact-icon">📞</span>
                <a href="tel:+9779864512825">+977 9864512825</a>
              </li>
              <li>
                <span className="footer-contact-icon">📧</span>
                <a href="mailto:support@cleancart.com">support@cleancart.com</a>
              </li>
              <li>
                <span className="footer-contact-icon">📍</span>
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>

          {/* General Info */}
          <div className="footer-col">
            <h4 className="footer-heading">About CleanCart</h4>
            <p className="footer-text">
              CleanCart is your one-stop platform for comparing computer accessory prices across multiple stores. We help you make informed purchases.
            </p>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p>&copy; {currentYear} CleanCart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
