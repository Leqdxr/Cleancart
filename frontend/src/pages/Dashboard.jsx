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
  const { orders, cart, products, updateOrderStatus } = useCart();

  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const userOrders = useMemo(
    () => orders.filter((o) => o.userId === user?.id || o.userEmail === user?.email).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, user]
  );

  const filtered = filterStatus === "all" ? userOrders : userOrders.filter((o) => o.status === filterStatus);

  const stats = useMemo(() => ({
    total: userOrders.length,
    pending: userOrders.filter((o) => o.status === "pending").length,
    shipped: userOrders.filter((o) => o.status === "shipped" || o.status === "processing").length,
    delivered: userOrders.filter((o) => o.status === "delivered").length,
  }), [userOrders]);

  function getProduct(id) { return products.find((p) => p.id === id); }
  function getStoreName(id) { return STORES.find((s) => s.id === id)?.name || id; }

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
            {ALL_STATUSES.map((s) => (
              <button key={s} className={filterStatus === s ? "tab active" : "tab"} onClick={() => setFilterStatus(s)}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="orders-empty card">
            <div className="empty-icon">📦</div>
            <h3>{userOrders.length === 0 ? "No orders yet" : "No orders with this status"}</h3>
            <p className="muted">{userOrders.length === 0 ? "Browse products and place your first order!" : "Try a different filter."}</p>
            {userOrders.length === 0 && <Link to="/products" className="btn btn-primary" style={{marginTop:"1rem"}}>Shop Now</Link>}
          </div>
        )}

        <div className="orders-list">
          {filtered.map((order) => {
            const product = getProduct(order.productId);
            const storeName = getStoreName(order.storeId);
            const isExp = expandedId === order.id;
            const statusColor = STATUS_COLORS[order.status] || "#a0aec0";

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
                      <span className="order-qty">Qty: {order.quantity}</span>
                    </div>
                    <div className="order-date muted">{new Date(order.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}</div>
                  </div>

                  {/* Status + expand */}
                  <div className="order-right">
                    <span className="status-badge" style={{ background: `${statusColor}22`, color: statusColor, borderColor: `${statusColor}55` }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="expand-chevron">{isExp ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExp && (
                  <div className="order-detail">
                    <div className="detail-grid">
                      <div><span className="dl">Order ID</span><span className="dv">{order.id}</span></div>
                      <div><span className="dl">Payment</span><span className="dv">{order.paymentMethod || "Cash on Delivery"}</span></div>
                      <div><span className="dl">Delivery address</span><span className="dv">{order.address}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
