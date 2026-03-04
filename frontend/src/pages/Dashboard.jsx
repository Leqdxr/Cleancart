import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { stores as STORES } from "../data/catalog";
import "../styles/Dashboard.css";

const STATUS_COLORS = { pending: "#f6ad55", processing: "#63b3ed", shipped: "#68d391", delivered: "#48bb78", cancelled: "#fc8181" };
const STATUS_LABELS = { pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const ALL_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function Dashboard() {
  const { user } = useAuth();
  const { orders, cart, products, deleteOrder } = useCart();

  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const userOrders = useMemo(
    () => orders
      .filter((o) =>
        o.userId === user?.id ||
        o.userEmail === user?.email ||
        o.customerEmail === user?.email
      )
      .sort((a, b) => new Date(b.createdAt || b.placedAt) - new Date(a.createdAt || a.placedAt)),
    [orders, user]
  );

  // Split into active and completed orders
  const activeOrders = useMemo(() => userOrders.filter((o) => (o.status || '').toLowerCase() !== 'delivered'), [userOrders]);
  const completedOrders = useMemo(() => userOrders.filter((o) => (o.status || '').toLowerCase() === 'delivered'), [userOrders]);

  const ACTIVE_STATUSES = ["pending", "processing", "shipped", "cancelled"];
  const filtered = filterStatus === "all" ? activeOrders : activeOrders.filter((o) => (o.status || "").toLowerCase() === filterStatus);

  const stats = useMemo(() => ({
    total: userOrders.length,
    pending: userOrders.filter((o) => ["pending","Pending"].includes(o.status)).length,
    shipped: userOrders.filter((o) => ["shipped","processing"].includes((o.status||"").toLowerCase())).length,
    delivered: userOrders.filter((o) => (o.status||"").toLowerCase() === "delivered").length,
  }), [userOrders]);

  function getProduct(id) { return products.find((p) => p.id === id); }
  function getStoreName(id) { return STORES.find((s) => s.id === id)?.name || id; }
  function confirmDelete(order) { setDeleteTarget(order); }
  function doDelete() { if (deleteTarget) { deleteOrder(deleteTarget.id); setDeleteTarget(null); } }

  return (
    <div className="dash-shell">
      {/* ── Header ── */}
      <div className="dash-hero">
        <div className="dash-hero-text">
          <p className="eyebrow">Dashboard</p>
          <h1>Hello, {user?.name?.split(" ")[0] || "there"} 👋</h1>
          <p className="muted dash-sub">Track your orders, manage your cart, and stay updated below.</p>
        </div>
        <Link to="/products" className="dash-shop-btn">
          🛍 Browse Products
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {[
          { label: "Total Orders", value: stats.total, icon: "📋", color: "#667eea" },
          { label: "Pending", value: stats.pending, icon: "⏳", color: "#f6ad55" },
          { label: "In Transit", value: stats.shipped, icon: "🚚", color: "#63b3ed" },
          { label: "Delivered", value: stats.delivered, icon: "✅", color: "#48bb78" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card card">
            <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
            <div className="stat-body">
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cart summary ── */}
      {cart.length > 0 && (
        <div className="cart-summary card">
          <div className="cart-sum-left">
            <span className="cart-sum-icon">🛒</span>
            <span><strong>{cart.length}</strong> item{cart.length !== 1 ? "s" : ""} in your cart</span>
          </div>
          <Link to="/products" className="cart-sum-cta">View Products</Link>
        </div>
      )}

      {/* ── Orders ── */}
      <div className="orders-section">
        <div className="orders-header">
          <h2>My Orders</h2>
          <div className="status-filter">
            <button className={filterStatus === "all" ? "tab active" : "tab"} onClick={() => setFilterStatus("all")}>All</button>
            {ACTIVE_STATUSES.map((s) => (
              <button key={s} className={filterStatus === s ? "tab active" : "tab"} onClick={() => setFilterStatus(s)}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="orders-empty card">
            <div className="empty-icon">📦</div>
            <h3>{activeOrders.length === 0 ? "No active orders" : "No orders with this status"}</h3>
            <p className="muted">{activeOrders.length === 0 ? "Browse products and place your first order!" : "Try a different filter."}</p>
            {activeOrders.length === 0 && <Link to="/products" className="btn btn-primary" style={{marginTop:"1rem"}}>Shop Now</Link>}
          </div>
        )}

        <div className="orders-list">
          {filtered.map((order) => {
            const product = getProduct(order.productId);
            const storeName = getStoreName(order.storeId || order.selectedStoreId);
            const isExp = expandedId === order.id;
            const statusKey = (order.status || "pending").toLowerCase();
            const statusColor = STATUS_COLORS[statusKey] || "#a0aec0";
            const displayDate = order.createdAt || order.placedAt;

            return (
              <div key={order.id} className="order-card card">
                <div className="order-main" onClick={() => setExpandedId(isExp ? null : order.id)}>
                  {/* Thumbnail */}
                  <div className="order-thumb">
                    {product?.imageUrl ? (
                      <img src={product.imageUrl} alt={order.productName} className="order-thumb-img" />
                    ) : (
                      <div className="order-thumb-placeholder">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="order-info">
                    <h3 className="order-product-name">{order.productName}</h3>
                    <div className="order-meta-row">
                      <span className="order-store">{storeName}</span>
                      <span className="order-dot">·</span>
                      <span className="order-price">${Number(order.total || order.price || 0).toFixed(2)}</span>
                      <span className="order-dot">·</span>
                      <span className="order-qty">Qty: {order.quantity || 1}</span>
                    </div>
                    {order.address && <div className="order-address muted">📍 {order.address}</div>}
                    {displayDate && <div className="order-date muted">{new Date(displayDate).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}</div>}
                  </div>

                  {/* Status + expand */}
                  <div className="order-right">
                    <span className="status-badge" style={{ background: `${statusColor}22`, color: statusColor, borderColor: `${statusColor}55` }}>
                      {STATUS_LABELS[statusKey] || order.status}
                    </span>
                    <span className="expand-chevron">{isExp ? "▲" : "▼"} Details</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExp && (
                  <div className="order-detail">
                    <div className="detail-grid">
                      <div><span className="dl">Order ID</span><span className="dv">{order.id}</span></div>
                      <div><span className="dl">Payment</span><span className="dv">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod || "Cash on Delivery"}</span></div>
                      <div><span className="dl">Store</span><span className="dv">{storeName}</span></div>
                      <div><span className="dl">Delivery address</span><span className="dv">{order.address}</span></div>
                      <div><span className="dl">Item total</span><span className="dv">${Number(order.price || 0).toFixed(2)} × {order.quantity || 1}</span></div>
                      <div><span className="dl">Order total</span><span className="dv order-total-highlight">${Number(order.total || 0).toFixed(2)}</span></div>
                    </div>
                    <button className="order-delete-btn" onClick={(e) => { e.stopPropagation(); confirmDelete(order); }}>🗑 Delete Order</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Completed Orders ── */}
      {completedOrders.length > 0 && (
        <div className="completed-section">
          <div className="completed-header" onClick={() => setShowCompleted((v) => !v)}>
            <h2>
              <span className="completed-icon">✅</span>
              Completed Orders
              <span className="order-total-pill">{completedOrders.length}</span>
            </h2>
            <span className="expand-chevron">{showCompleted ? '▲ Hide' : '▼ Show'}</span>
          </div>

          {showCompleted && (
            <div className="orders-list">
              {completedOrders.map((order) => {
                const product = getProduct(order.productId);
                const storeName = getStoreName(order.storeId || order.selectedStoreId);
                const isExp = expandedId === order.id;
                const displayDate = order.createdAt || order.placedAt;

                return (
                  <div key={order.id} className="order-card card completed-card">
                    <div className="order-main" onClick={() => setExpandedId(isExp ? null : order.id)}>
                      <div className="order-thumb">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={order.productName} className="order-thumb-img" />
                        ) : (
                          <div className="order-thumb-placeholder">📦</div>
                        )}
                      </div>
                      <div className="order-info">
                        <h3 className="order-product-name">{order.productName}</h3>
                        <div className="order-meta-row">
                          <span className="order-store">{storeName}</span>
                          <span className="order-dot">·</span>
                          <span className="order-price">${Number(order.total || order.price || 0).toFixed(2)}</span>
                          <span className="order-dot">·</span>
                          <span className="order-qty">Qty: {order.quantity || 1}</span>
                        </div>
                        {displayDate && <div className="order-date muted">{new Date(displayDate).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}</div>}
                      </div>
                      <div className="order-right">
                        <span className="status-badge completed-badge">✅ Delivered</span>
                        <span className="expand-chevron">{isExp ? "▲" : "▼"} Details</span>
                      </div>
                    </div>
                    {isExp && (
                      <div className="order-detail">
                        <div className="detail-grid">
                          <div><span className="dl">Order ID</span><span className="dv">{order.id}</span></div>
                          <div><span className="dl">Payment</span><span className="dv">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod || "Cash on Delivery"}</span></div>
                          <div><span className="dl">Store</span><span className="dv">{storeName}</span></div>
                          <div><span className="dl">Delivery address</span><span className="dv">{order.address}</span></div>
                          <div><span className="dl">Item total</span><span className="dv">${Number(order.price || 0).toFixed(2)} × {order.quantity || 1}</span></div>
                          <div><span className="dl">Order total</span><span className="dv order-total-highlight">${Number(order.total || 0).toFixed(2)}</span></div>
                        </div>
                        <button className="order-delete-btn" onClick={(e) => { e.stopPropagation(); confirmDelete(order); }}>🗑 Delete Order</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="confirm-modal card">
            <h3>Delete this order?</h3>
            <p>Are you sure you want to remove <strong>"{deleteTarget.productName}"</strong>? This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
