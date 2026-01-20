import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Products.css';

const steps = ['Stores', 'Shipping', 'Payment'];

function Products() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { products, cart, addToCart, removeFromCart, updateQuantity, priceMatrix, checkoutCart } = useCart();

  const [category, setCategory] = useState('All');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [shipping, setShipping] = useState({ name: '', email: '', phone: '', address: '', city: '', zip: '' });
  const [payment, setPayment] = useState({ method: 'card', note: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedStore, setExpandedStore] = useState(null);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);

  const filteredProducts = useMemo(
    () => (category === 'All' ? products : products.filter((p) => p.category === category)),
    [category, products]
  );

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const bestStore = useMemo(() => {
    if (!cart.length) return null;
    const viable = priceMatrix.filter((store) => store.missingCount === 0);
    if (!viable.length) return null;
    return [...viable].sort((a, b) => a.total - b.total)[0];
  }, [cart.length, priceMatrix]);

  const openCheckout = () => {
    if (!cart.length) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowCheckout(true);
    setActiveStep(0);
    if (bestStore) setSelectedStoreId(bestStore.id);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setExpandedStore(null);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handlePlaceOrder = () => {
    if (!selectedStoreId) return;
    checkoutCart({ user, storeId: selectedStoreId, address: shipping, paymentMethod: payment.method, paymentNote: payment.note });
    setShowCheckout(false);
    setShipping({ name: '', email: '', phone: '', address: '', city: '', zip: '' });
    setPayment({ method: 'card', note: '' });
    setSelectedStoreId('');
    setActiveStep(0);
  };

  if (!isAuthenticated) {
    return (
      <div className="products-shell">
        <div className="card login-wall">
          <div className="lock-icon">🔒</div>
          <h1>Login required</h1>
          <p>Sign in to explore computer accessories and compare per-store pricing.</p>
          <div className="login-actions">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-outline">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedStore = priceMatrix.find((store) => store.id === selectedStoreId);
  const itemsSubtotal = selectedStore?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <div className="products-shell">
      <div className="products-header">
        <div>
          <p className="eyebrow">Accessories, curated</p>
          <h1>Compare prices before you commit.</h1>
          <p className="muted">Add items to your cart, then review every store's total with delivery and stock clarity.</p>
        </div>
        <div className="badge-grid">
          <span className="badge">Live stock</span>
          <span className="badge">Delivery fees shown</span>
          <span className="badge">Cart-wide totals</span>
        </div>
      </div>

      <div className="products-layout">
        <section className="product-catalog card">
          <div className="catalog-head">
            <h2>Catalog</h2>
            <div className="pill">Accessory catalog</div>
          </div>
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="catalog-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-head">
                  <div className="pill">{product.heroTag}</div>
                  <span className="brand">{product.brand}</span>
                </div>
                <h3>{product.name}</h3>
                <p className="muted">{product.description}</p>
                <div className="specs">
                  {product.specs.map((spec) => (
                    <span key={spec} className="badge">{spec}</span>
                  ))}
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => addToCart(product.id)}>
                    Add to cart
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/about')}>
                    Learn more
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="cart-panel card">
          <div className="panel-head">
            <h3>Cart overview</h3>
            <span className="pill">{cart.length} items</span>
          </div>

          {!cartItems.length && (
            <div className="empty-cart">
              <p>No items yet. Add a mouse, keyboard, or headset to begin.</p>
            </div>
          )}

          {cartItems.map((item) => (
            <div key={item.id} className="cart-line">
              <div>
                <strong>{item.name}</strong>
                <span className="muted">{item.brand}</span>
              </div>
              <div className="cart-controls">
                <div className="qty">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="text-link" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}

          <div className="panel-foot">
            <button className="btn btn-primary" disabled={!cart.length} onClick={openCheckout}>
              Checkout and compare
            </button>
            <p className="muted small">Checkout saves the cart to the dashboard.</p>
          </div>
        </aside>
      </div>

      {showCheckout && (
        <div className="checkout-modal-backdrop" onClick={closeCheckout}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-sidebar">
              <h3>Compare & Checkout</h3>
              <div className="step-list">
                {steps.map((label, idx) => (
                  <div key={label} className={`step-pill ${idx === activeStep ? 'active' : ''}`}>
                    <div className="step-index">{idx + 1}</div>
                    <div>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="checkout-body">
              <div className="checkout-header">
                <h2>{steps[activeStep]}</h2>
                <span className="chip">{cart.length} items</span>
              </div>

              {activeStep === 0 && (
                <div className="store-grid">
                  {!cart.length && <p>Add items to compare.</p>}
                  {priceMatrix.map((store) => {
                    const isSelected = selectedStoreId === store.id;
                    return (
                      <div key={store.id} className={`store-card ${isSelected ? 'selected' : ''}`}>
                        <div className="store-top">
                          <div className="store-meta">
                            <h4>{store.name}</h4>
                            <span className="chip">${store.total.toFixed(2)}</span>
                          </div>
                          <button className={`pill-btn ${isSelected ? 'active' : ''}`} onClick={() => setSelectedStoreId(store.id)}>
                            {isSelected ? 'Selected' : 'Choose store'}
                          </button>
                        </div>
                        <div className="store-meta">
                          <span className="muted small">ETA {store.eta} • ${store.deliveryFee.toFixed(2)} delivery</span>
                          <span className="badge">Missing: {store.missingCount}</span>
                        </div>
                        <div className="detail-link" onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}>
                          {expandedStore === store.id ? 'Hide item details' : 'Show item details'}
                        </div>
                        {expandedStore === store.id && (
                          <div className="item-list">
                            {store.items.map((item) => (
                              <div key={`${store.id}-${item.id}`} className="item-row">
                                <span>{item.name}</span>
                                <span>${item.price.toFixed(2)}</span>
                                <span>x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeStep === 1 && (
                <div className="form-grid">
                  {[
                    { label: 'Full name', name: 'name', placeholder: 'Alex Doe' },
                    { label: 'Email', name: 'email', placeholder: 'alex@example.com' },
                    { label: 'Phone', name: 'phone', placeholder: '+1 202 555 0123' },
                    { label: 'Address', name: 'address', placeholder: '123 Market St' },
                    { label: 'City', name: 'city', placeholder: 'San Francisco' },
                    { label: 'ZIP', name: 'zip', placeholder: '94103' },
                  ].map((field) => (
                    <div className="input-field" key={field.name}>
                      <label>{field.label}</label>
                      <input
                        name={field.name}
                        value={shipping[field.name]}
                        onChange={handleShippingChange}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeStep === 2 && (
                <div className="form-grid">
                  <div className="input-field">
                    <label>Payment method</label>
                    <select name="method" value={payment.method} onChange={handlePaymentChange}>
                      <option value="card">Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="cash">Cash on delivery</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Notes</label>
                    <input
                      name="note"
                      value={payment.note}
                      onChange={handlePaymentChange}
                      placeholder="Any delivery instructions"
                    />
                  </div>
                  <div className="store-card">
                    <div className="store-top">
                      <div className="store-meta">
                        <h4>{selectedStore?.name || 'Pick a store'}</h4>
                      </div>
                      <span className="chip">Delivery: ${selectedStore?.deliveryFee?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="divider" />
                    <div className="item-list">
                      {cartItems.map((item) => {
                        const match = selectedStore?.items.find((p) => p.id === item.id);
                        const price = match?.price || 0;
                        return (
                          <div key={`${item.id}-summary`} className="item-row">
                            <span>{item.name}</span>
                            <span>${price.toFixed(2)}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="divider" />
                    <div className="store-top">
                      <span>Items total</span>
                      <strong>${itemsSubtotal.toFixed(2)}</strong>
                    </div>
                    <div className="store-top">
                      <span>Delivery</span>
                      <strong>${selectedStore?.deliveryFee?.toFixed(2) || '0.00'}</strong>
                    </div>
                    <div className="store-top">
                      <span>Order total</span>
                      <strong>${selectedStore ? (itemsSubtotal + selectedStore.deliveryFee).toFixed(2) : '0.00'}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="checkout-footer">
                <div>
                  <span className="chip">Selected store: {selectedStore?.name || 'None'}</span>
                </div>
                <div className="step-actions">
                  {activeStep > 0 && (
                    <button className="ghost-btn" onClick={prevStep}>
                      Back
                    </button>
                  )}
                  {activeStep < steps.length - 1 && (
                    <button className="btn btn-primary" onClick={nextStep} disabled={!selectedStoreId && activeStep === 0}>
                      Continue
                    </button>
                  )}
                  {activeStep === steps.length - 1 && (
                    <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={!selectedStoreId}>
                      Place order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
