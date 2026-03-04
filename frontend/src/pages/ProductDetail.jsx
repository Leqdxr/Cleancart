import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { stores as STORES } from "../data/catalog";
import "../styles/ProductDetail.css";

const STEPS = ["Select Store", "Shipping", "Payment"];

function StarRating({ value }) {
  return (
    <span className="stars" title={`${value} / 5`}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? "star filled" : "star"}>★</span>
      ))}
      <span className="star-val">{value ? value.toFixed(1) : "?"}</span>
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { products, checkoutSingleProduct } = useCart();

  const product = products.find((p) => p.id === id);

  // Compute store list early (safe if product is null) so hooks run unconditionally
  const availableStores = Object.entries(product?.stores || {})
    .filter(([, data]) => data.available)
    .map(([sid, data]) => {
      const storeMeta = STORES.find((s) => s.id === sid) || { name: sid };
      return { id: sid, meta: storeMeta, ...data };
    });
  const recommendedStore = availableStores.length
    ? availableStores.reduce((best, s) => (Number(s.rating || 0) > Number(best.rating || 0) ? s : best))
    : null;
  const cheapestStore = availableStores.length
    ? availableStores.reduce((low, s) => (Number(s.price || 0) < Number(low.price || 0) ? s : low))
    : null;
  const maxPrice = availableStores.length ? Math.max(...availableStores.map((s) => Number(s.price || 0))) : 0;

  /* ── Modal state ── */
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  /* Step 1 */
  const [selectedStore, setSelectedStore] = useState(null);

  /* Step 2 */
  const [addr, setAddr] = useState({ name: user?.name || "", email: user?.email || "", phone: "", address: "", city: "", zip: "" });

  /* Step 3 / result */
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");

  // Reset modal state when opened; auto-select recommended store
  useEffect(() => {
    if (open) {
      setStep(0); setSelectedStore(recommendedStore || null);
      setAddr({ name: user?.name || "", email: user?.email || "", phone: "", address: "", city: "", zip: "" });
      setSuccess(false); setErr("");
    }
  }, [open]);

  if (!isAuthenticated) {
    return (
      <div className="pd-shell">
        <div className="pd-wall card">
          <div className="lock-icon">🔒</div>
          <h2>Login to view this product</h2>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-shell">
        <div className="pd-wall card">
          <div className="empty-icon">🔍</div>
          <h2>Product not found</h2>
          <Link to="/products" className="btn btn-outline">Back to Products</Link>
        </div>
      </div>
    );
  }

  /* ── Address helpers ── */
  const addrFilled = addr.name && addr.email && addr.phone && addr.address && addr.city && addr.zip;

  async function placeOrder() {
    if (!selectedStore || !addrFilled) return;
    setPlacing(true); setErr("");
    try {
      await checkoutSingleProduct({
        user,
        productId: product.id,
        storeId: selectedStore.id,
        quantity: 1,
        address: `${addr.address}, ${addr.city} ${addr.zip} — ${addr.phone} (${addr.name})`,
        paymentMethod: "Cash on Delivery",
      });
      setSuccess(true);
      setTimeout(() => { setOpen(false); navigate("/dashboard"); }, 2200);
    } catch (e) {
      setErr(e.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="pd-shell">
      {/* Back link */}
      <Link to="/products" className="pd-back">← Back to Products</Link>

      <div className="pd-layout">
        {/* ── Left: Image ── */}
        <div className="pd-img-col">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="pd-img" />
          ) : (
            <div className="pd-img-placeholder">📦</div>
          )}
        </div>

        {/* ── Right: Info ── */}
        <div className="pd-info-col">
          {product.category && <span className="product-tag">{product.category}</span>}
          <h1 className="pd-title">{product.name}</h1>
          <p className="pd-desc">{product.description}</p>

          <h2 className="pd-stores-heading">Available at {availableStores.length} store{availableStores.length !== 1 ? "s" : ""}</h2>

          {availableStores.length === 0 && (
            <p className="muted">This product is not available in any store yet.</p>
          )}

          {/* ── Price comparison table ── */}
          {availableStores.length > 1 && (
            <div className="price-comparison-banner">
              <div className="pcb-header">
                <span className="pcb-title">📊 Price Comparison</span>
                {recommendedStore && (
                  <span className="pcb-rec-label">We recommend: <strong>{recommendedStore.meta.name}</strong> ⭐</span>
                )}
              </div>
              <div className="pcb-rows">
                {[...availableStores].sort((a, b) => Number(a.price) - Number(b.price)).map((store) => {
                  const isRec = store.id === recommendedStore?.id;
                  const isCheap = store.id === cheapestStore?.id;
                  const saving = maxPrice - Number(store.price || 0);
                  const barPct = maxPrice > 0 ? Math.round((Number(store.price) / maxPrice) * 100) : 100;
                  return (
                    <div key={store.id} className={`pcb-row ${isRec ? "pcb-row-rec" : ""}`}>
                      <div className="pcb-store-name">
                        {store.meta.name}
                        {isRec && <span className="pcb-badge pcb-badge-rec">⭐ Recommended</span>}
                        {isCheap && !isRec && <span className="pcb-badge pcb-badge-cheap">💰 Cheapest</span>}
                      </div>
                      <div className="pcb-bar-wrap">
                        <div className="pcb-bar" style={{ width: `${barPct}%`, background: isRec ? "var(--green)" : "var(--border)" }} />
                      </div>
                      <div className="pcb-price-info">
                        <span className="pcb-price">${Number(store.price).toFixed(2)}</span>
                        {saving > 0.01 && <span className="pcb-saving">Save ${saving.toFixed(2)}</span>}
                      </div>
                      <StarRating value={store.rating} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pd-stores-list">
            {availableStores.map((store) => {
              const isRec = store.id === recommendedStore?.id;
              const isCheap = store.id === cheapestStore?.id && store.id !== recommendedStore?.id;
              return (
                <div key={store.id} className={`pd-store-card card ${isRec ? "pd-store-recommended" : ""}`}>
                  <div className="pd-store-top">
                    <div>
                      <div className="pd-store-name-row">
                        <h3 className="pd-store-name">{store.meta.name}</h3>
                        {isRec && <span className="pd-rec-badge">⭐ Recommended</span>}
                        {isCheap && <span className="pd-cheap-badge">💰 Best Price</span>}
                      </div>
                      <StarRating value={store.rating} />
                    </div>
                    <span className="pd-store-price">${Number(store.price).toFixed(2)}</span>
                  </div>
                  <div className="pd-store-meta">
                    <span>📦 Stock: <strong>{store.stock}</strong></span>
                    <span>🚚 Delivery: <strong>${Number(store.deliveryCost).toFixed(2)}</strong></span>
                    <span>Total: <strong className="pd-total-price">${(Number(store.price) + Number(store.deliveryCost)).toFixed(2)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {availableStores.length > 0 && (
            <button className="btn btn-primary pd-cta" onClick={() => setOpen(true)}>
              Add to Cart &amp; Checkout
            </button>
          )}
        </div>
      </div>

      {/* ──────────── CHECKOUT MODAL ──────────── */}
      {open && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="modal-box" role="dialog" aria-modal="true">
            {success ? (
              <div className="order-success">
                <div className="success-check">✓</div>
                <h2>Order placed!</h2>
                <p className="muted">Redirecting to your dashboard…</p>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="step-bar">
                  {STEPS.map((label, i) => (
                    <div key={label} className={`step-item ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                      <div className="step-dot">{i < step ? "✓" : i + 1}</div>
                      <span>{label}</span>
                      {i < STEPS.length - 1 && <div className="step-line" />}
                    </div>
                  ))}
                </div>

                {/* ── Step 0: Store select ── */}
                {step === 0 && (
                  <div className="modal-step">
                    <h3>Select a store</h3>
                    <div className="store-options">
                      {availableStores.map((store) => {
                        const isRec = store.id === recommendedStore?.id;
                        const isCheap = store.id === cheapestStore?.id && store.id !== recommendedStore?.id;
                        return (
                          <div
                            key={store.id}
                            className={`store-option card ${selectedStore?.id === store.id ? "selected" : ""} ${isRec ? "store-option-rec" : ""}`}
                            onClick={() => setSelectedStore(store)}
                          >
                            <div className="so-row">
                              <div>
                                <div className="so-name-row">
                                  <strong>{store.meta.name}</strong>
                                  {isRec && <span className="so-badge so-badge-rec">⭐ Rec</span>}
                                  {isCheap && <span className="so-badge so-badge-cheap">💰</span>}
                                </div>
                                <StarRating value={store.rating} />
                              </div>
                              <div className="so-right">
                                <span className="price-value">${Number(store.price).toFixed(2)}</span>
                                <span className="muted">+${Number(store.deliveryCost).toFixed(2)} delivery</span>
                              </div>
                            </div>
                            <p className="muted" style={{fontSize:'0.78rem',margin:'4px 0 0'}}>
                              {store.stock} in stock
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
                      <button className="btn btn-primary" disabled={!selectedStore} onClick={() => setStep(1)}>Continue</button>
                    </div>
                  </div>
                )}

                {/* ── Step 1: Shipping ── */}
                {step === 1 && (
                  <div className="modal-step">
                    <h3>Shipping details</h3>
                    <div className="addr-grid">
                      {[
                        {k:"name", label:"Full name", type:"text"},
                        {k:"email", label:"Email", type:"email"},
                        {k:"phone", label:"Phone", type:"tel"},
                        {k:"address", label:"Street address", type:"text"},
                        {k:"city", label:"City", type:"text"},
                        {k:"zip", label:"ZIP / Postal code", type:"text"},
                      ].map(({k, label, type}) => (
                        <label key={k} className={k === "address" ? "full-span" : ""}>
                          <span>{label}</span>
                          <input
                            type={type}
                            value={addr[k]}
                            onChange={(e) => setAddr((a) => ({...a, [k]: e.target.value}))}
                            placeholder={label}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="modal-actions">
                      <button className="btn btn-outline" onClick={() => setStep(0)}>Back</button>
                      <button className="btn btn-primary" disabled={!addrFilled} onClick={() => setStep(2)}>Continue</button>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Payment ── */}
                {step === 2 && (
                  <div className="modal-step">
                    <h3>Payment &amp; Review</h3>
                    <div className="review-card card">
                      <p><strong>Product:</strong> {product.name}</p>
                      <p><strong>Store:</strong> {selectedStore?.meta?.name}</p>
                      <p><strong>Price:</strong> ${Number(selectedStore?.price||0).toFixed(2)}</p>
                      <p><strong>Delivery:</strong> ${Number(selectedStore?.deliveryCost||0).toFixed(2)}</p>
                      <p className="review-total"><strong>Total:</strong> ${(Number(selectedStore?.price||0) + Number(selectedStore?.deliveryCost||0)).toFixed(2)}</p>
                      <p><strong>Ship to:</strong> {addr.address}, {addr.city} {addr.zip}</p>
                    </div>
                    <div className="payment-option card">
                      <span className="payment-icon">💵</span>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p className="muted" style={{margin:0,fontSize:'0.82rem'}}>Pay when your order arrives</p>
                      </div>
                      <span className="payment-check">✓</span>
                    </div>
                    {err && <p className="err-msg">{err}</p>}
                    <div className="modal-actions">
                      <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                      <button className="btn btn-primary" disabled={placing} onClick={placeOrder}>
                        {placing ? "Placing…" : "Place Order"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
