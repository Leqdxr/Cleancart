/**
 * Products Catalog Page Component
 *
 * Displays the product catalog with search and category filtering
 * Features:
 * - Login wall for unauthenticated users
 * - Search bar for name/description filtering
 * - Category tabs for category-based filtering
 * - Product cards showing image, price range, and store count
 * - Click-to-navigate to product detail page
 * - Cart item count badge
 * - Empty state for no products or no search results
 * - Entry animations with staggered delays
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/Products.css";

function Products() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { products, cart } = useCart();
  // Search query for filtering products by name/description
  const [search, setSearch] = useState("");
  // Currently selected category tab
  const [category, setCategory] = useState("All");

  // Build unique category list from products, prepend "All"
  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

  // Filter products by category and search query
  const filtered = useMemo(() => {
    let list = category === "All" ? products : products.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return list;
  }, [products, category, search]);

  // Number of items in cart for badge display
  const cartCount = cart.length;

  // Show login wall if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="products-shell">
        <div className="login-wall card">
          <div className="lock-icon">🔒</div>
          <h1>Login required</h1>
          <p>Sign in to explore products and compare per-store pricing.</p>
          <div className="login-actions">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-outline">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-shell">
      <div className="products-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Browse products</h1>
          <p className="muted">Click any product to see store prices, ratings, and add to cart.</p>
        </div>
        <Link to="/dashboard" className="cart-fab">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>

      <div className="products-controls">
        <input
          type="text"
          className="products-search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-catalog card">
          <div className="empty-icon">📦</div>
          {products.length === 0 ? (
            <>
              <h2>No products yet</h2>
              <p className="muted">Products will appear here once an admin adds them.</p>
            </>
          ) : (
            <>
              <h2>No results</h2>
              <p className="muted">Try a different search or category.</p>
            </>
          )}
        </div>
      )}

      <div className="products-grid">
        {filtered.map((product, idx) => {
          const storeIds = Object.keys(product.stores || {});
          const prices = storeIds.map((sid) => product.stores[sid]?.price).filter(Boolean);
          const minPrice = prices.length ? Math.min(...prices) : null;

          return (
            <div
              key={product.id}
              className="product-card card"
              style={{ animationDelay: `${idx * 0.06}s` }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="product-img-wrap">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="product-img" />
                ) : (
                  <div className="product-img-placeholder">📦</div>
                )}
                {product.category && <span className="product-tag">{product.category}</span>}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-desc muted">{product.description}</p>
                <div className="product-footer">
                  <div className="product-price">
                    {minPrice != null ? (
                      <>
                        <span className="price-label">From</span>
                        <span className="price-value">${minPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="price-label muted">No pricing</span>
                    )}
                  </div>
                  <span className="store-count">{storeIds.length} store{storeIds.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Products;
