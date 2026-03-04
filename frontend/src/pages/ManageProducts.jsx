/**
 * Manage Products Admin Page Component
 *
 * Admin interface for product catalog management
 * Features:
 * - Add new products with name, description, category, and image upload
 * - Configure per-store availability, price, stock, delivery cost, and rating
 * - Image upload via file picker (converted to base64)
 * - Form validation with error messages per field
 * - Existing products list with expandable store details
 * - Delete products with confirmation modal
 * - Product count badge
 * - Success message on product creation
 */

import { useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import { stores as STORES } from "../data/catalog";
import "../styles/ManageProducts.css";

// Default empty store data template
const EMPTY_STORE = { available: false, price: "", stock: "", deliveryCost: "", rating: "" };

/**
 * Create a fresh form state with empty fields and store data for all stores
 * @returns {Object} Initial form state
 */
function newForm() {
  const storeData = {};
  STORES.forEach((s) => { storeData[s.id] = { ...EMPTY_STORE }; });
  return { name: "", description: "", category: "", imageUrl: "", storeData };
}

export default function ManageProducts() {
  const { products, addProduct, deleteProduct } = useCart();
  // File input ref for image upload
  const fileRef = useRef(null);

  // Form state for adding a new product
  const [form, setForm] = useState(newForm());
  // Image preview URL (base64)
  const [preview, setPreview] = useState(null);
  // Submission loading state
  const [submitting, setSubmitting] = useState(false);
  // Success notification message
  const [successMsg, setSuccessMsg] = useState("");
  // Field-level validation errors
  const [errors, setErrors] = useState({});
  // Product pending deletion
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Expanded product detail ID in the product list
  const [expandedId, setExpandedId] = useState(null);

  /* ── Field update helpers ── */
  /** Update a top-level form field and clear its error */
  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); }

  /** Update a store-specific field (price, stock, deliveryCost, rating) */
  function setStoreField(storeId, k, v) {
    setForm((f) => ({ ...f, storeData: { ...f.storeData, [storeId]: { ...f.storeData[storeId], [k]: v } } }));
  }

  /** Toggle store availability checkbox */
  function toggleStore(storeId) {
    setForm((f) => ({
      ...f,
      storeData: { ...f.storeData, [storeId]: { ...f.storeData[storeId], available: !f.storeData[storeId].available } },
    }));
  }

  /**
   * Handle image file selection
   * Reads file as base64 data URL for preview and storage
   */
  function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      setForm((f) => ({ ...f, imageUrl: url }));
      setPreview(url);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Validate form before submission
   * Checks required fields and store-specific numeric values
   * @returns {boolean} True if form is valid
   */
  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    const hasStore = Object.values(form.storeData).some((s) => s.available);
    if (!hasStore) errs.stores = "Select at least one store";
    Object.entries(form.storeData).forEach(([sid, s]) => {
      if (!s.available) return;
      const store = STORES.find((st) => st.id === sid)?.name || sid;
      if (!s.price || isNaN(Number(s.price)) || Number(s.price) < 0) errs[`${sid}_price`] = `${store}: invalid price`;
      if (!s.stock || isNaN(Number(s.stock)) || Number(s.stock) < 0) errs[`${sid}_stock`] = `${store}: invalid stock`;
      if (!s.deliveryCost || isNaN(Number(s.deliveryCost)) || Number(s.deliveryCost) < 0) errs[`${sid}_delivery`] = `${store}: invalid delivery`;
      if (!s.rating || isNaN(Number(s.rating)) || Number(s.rating) < 0 || Number(s.rating) > 5) errs[`${sid}_rating`] = `${store}: rating must be 0–5`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /**
   * Handle form submission
   * Builds stores object from enabled store data and adds product to catalog
   * Resets form on success with a timed success message
   */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const stores = {};
      Object.entries(form.storeData).forEach(([sid, s]) => {
        if (!s.available) return;
        stores[sid] = { available: true, price: Number(s.price), stock: Number(s.stock), deliveryCost: Number(s.deliveryCost), rating: Number(s.rating) };
      });
      addProduct({ name: form.name.trim(), description: form.description.trim(), category: form.category.trim(), imageUrl: form.imageUrl, stores });
      setSuccessMsg(`"${form.name}" added successfully!`);
      setForm(newForm()); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mp-shell">
      <div className="mp-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Manage Products</h1>
          <p className="muted">Add products to the catalog or remove existing ones.</p>
        </div>
        <span className="product-count-badge">{products.length} product{products.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ────────── ADD PRODUCT FORM ────────── */}
      <div className="mp-card card">
        <h2 className="mp-section-title">Add new product</h2>
        {successMsg && <div className="success-banner">{successMsg}</div>}
        <form onSubmit={handleSubmit} className="mp-form" noValidate>

          {/* Name + Category row */}
          <div className="mp-row-two">
            <div className="mp-field">
              <label>Product Name <span className="req">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Mechanical Keyboard" />
              {errors.name && <span className="field-err">{errors.name}</span>}
            </div>
            <div className="mp-field">
              <label>Category <span className="optional">(optional)</span></label>
              <input type="text" value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Keyboards" />
            </div>
          </div>

          {/* Description */}
          <div className="mp-field">
            <label>Short Description <span className="optional">(optional)</span></label>
            <textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Brief product description shown on product page…" />
          </div>

          {/* Image upload */}
          <div className="mp-field">
            <label>Product Image <span className="optional">(optional)</span></label>
            <div className="img-upload-area" onClick={() => fileRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="preview" className="img-preview" />
              ) : (
                <div className="img-upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span>Click to browse image from your PC</span>
                  <span className="muted" style={{fontSize:'0.78rem'}}>JPG, PNG, WEBP, GIF — max 10 MB</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageFile} />
            </div>
            {preview && (
              <button type="button" className="remove-img-btn" onClick={() => { setPreview(null); setForm((f) => ({...f, imageUrl:""})); if(fileRef.current) fileRef.current.value=""; }}>
                ✕ Remove image
              </button>
            )}
          </div>

          {/* Store checkboxes */}
          <div className="mp-field">
            <label>Available stores <span className="req">*</span></label>
            {errors.stores && <span className="field-err">{errors.stores}</span>}
            <div className="mp-stores-grid">
              {STORES.map((store) => {
                const s = form.storeData[store.id];
                return (
                  <div key={store.id} className={`mp-store-block ${s.available ? "active" : ""}`}>
                    <label className="store-checkbox-label">
                      <input type="checkbox" checked={s.available} onChange={() => toggleStore(store.id)} />
                      <span className="store-name">{store.name}</span>
                    </label>
                    {s.available && (
                      <div className="store-fields">
                        <div className="sf-row">
                          <div className="sf-field">
                            <span>Price ($)</span>
                            <input type="number" min="0" step="0.01" value={s.price} onChange={(e) => setStoreField(store.id, "price", e.target.value)} placeholder="0.00" />
                            {errors[`${store.id}_price`] && <span className="field-err">{errors[`${store.id}_price`]}</span>}
                          </div>
                          <div className="sf-field">
                            <span>Stock (units)</span>
                            <input type="number" min="0" step="1" value={s.stock} onChange={(e) => setStoreField(store.id, "stock", e.target.value)} placeholder="0" />
                            {errors[`${store.id}_stock`] && <span className="field-err">{errors[`${store.id}_stock`]}</span>}
                          </div>
                          <div className="sf-field">
                            <span>Delivery ($)</span>
                            <input type="number" min="0" step="0.01" value={s.deliveryCost} onChange={(e) => setStoreField(store.id, "deliveryCost", e.target.value)} placeholder="0.00" />
                            {errors[`${store.id}_delivery`] && <span className="field-err">{errors[`${store.id}_delivery`]}</span>}
                          </div>
                          <div className="sf-field">
                            <span>Rating (0–5)</span>
                            <input type="number" min="0" max="5" step="0.1" value={s.rating} onChange={(e) => setStoreField(store.id, "rating", e.target.value)} placeholder="4.5" />
                            {errors[`${store.id}_rating`] && <span className="field-err">{errors[`${store.id}_rating`]}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary mp-submit" disabled={submitting}>
            {submitting ? "Adding…" : "＋ Add Product"}
          </button>
        </form>
      </div>

      {/* ────────── PRODUCT LIST ────────── */}
      <div className="mp-list-section">
        <h2 className="mp-section-title">Existing products ({products.length})</h2>
        {products.length === 0 && (
          <div className="mp-empty card">
            <div className="empty-icon">📦</div>
            <p>No products added yet. Use the form above to add your first product.</p>
          </div>
        )}
        <div className="mp-products-list">
          {products.map((product) => {
            const storeIds = Object.keys(product.stores || {}).filter((sid) => product.stores[sid]?.available);
            const prices = storeIds.map((sid) => product.stores[sid]?.price).filter(Boolean);
            const minPrice = prices.length ? Math.min(...prices) : null;
            const isExpanded = expandedId === product.id;

            return (
              <div key={product.id} className="mp-product-row card">
                <div className="mp-product-main">
                  <div className="mp-product-thumb">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="mp-thumb-img" />
                    ) : (
                      <div className="mp-thumb-placeholder">📦</div>
                    )}
                  </div>
                  <div className="mp-product-text" onClick={() => setExpandedId(isExpanded ? null : product.id)}>
                    <h3>{product.name}</h3>
                    <p className="muted">{product.description || "No description"}</p>
                    <div className="mp-product-tags">
                      {product.category && <span className="product-tag">{product.category}</span>}
                      <span className="store-count-badge">{storeIds.length} store{storeIds.length !== 1 ? "s" : ""}</span>
                      {minPrice != null && <span className="price-badge">From ${minPrice.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="mp-product-actions">
                    <button className="expand-btn" onClick={() => setExpandedId(isExpanded ? null : product.id)}>
                      {isExpanded ? "▲ Hide" : "▼ Details"}
                    </button>
                    <button className="delete-btn" onClick={() => setDeleteTarget(product)}>Delete</button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mp-product-detail">
                    <div className="mp-store-pills">
                      {storeIds.map((sid) => {
                        const d = product.stores[sid];
                        const name = STORES.find((s) => s.id === sid)?.name || sid;
                        return (
                          <div key={sid} className="mp-store-pill">
                            <strong>{name}</strong>
                            <span>${Number(d.price).toFixed(2)}</span>
                            <span>Stock: {d.stock}</span>
                            <span>Del: ${Number(d.deliveryCost).toFixed(2)}</span>
                            <span>★ {Number(d.rating).toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="confirm-modal card">
            <h3>Delete product?</h3>
            <p>Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This will also remove it from all carts.</p>
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteProduct(deleteTarget.id); setDeleteTarget(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
