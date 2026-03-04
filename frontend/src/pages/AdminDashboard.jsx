import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { stores as STORES } from "../data/catalog";
import "../styles/AdminDashboard.css";

const STATUS_COLORS = { pending: "#f6ad55", processing: "#63b3ed", shipped: "#68d391", delivered: "#48bb78", cancelled: "#fc8181" };
const STATUS_LABELS = { pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const ALL_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { orders, products, updateOrderStatus } = useCart();

  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filterStatus !== "all") list = list.filter((o) => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.productName?.toLowerCase().includes(q) || o.address?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q));
    }
    return list;
  }, [orders, filterStatus, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total || o.price || 0), 0),
  }), [orders]);

  function getProduct(id) { return products.find((p) => p.id === id); }
  function getStoreName(id) { return STORES.find((s) => s.id === id)?.name || id; }

  return (
    <div className="adash-shell">
      {/* ── Header ── */}
      <div className="adash-hero">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Dashboard</h1>
          <p className="muted">Manage orders, products, and users from here.</p>
        </div>
        <div className="admin-quick-links">
          <Link to="/admin/users" className="ql-btn">👥 Users</Link>
          <Link to="/admin/products" className="ql-btn ql-primary">📦 Products</Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="astats-grid">
        {[
          { label: "Total Orders", value: stats.total, icon: "📋", color: "#667eea" },
          { label: "Pending", value: stats.pending, icon: "⏳", color: "#f6ad55" },
          { label: "Processing", value: stats.processing, icon: "⚙️", color: "#63b3ed" },
          { label: "Delivered", value: stats.delivered, icon: "✅", color: "#48bb78" },
          { label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: "💰", color: "#9f7aea", wide: true },
        ].map(({ label, value, icon, color, wide }) => (
          <div key={label} className={`astat-card card ${wide ? "wide" : ""}`}>
            <div className="astat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
            <div className="astat-body">
              <span className="astat-value">{value}</span>
              <span className="astat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Orders ── */}
      <div className="aorders-section">
        <div className="aorders-top">
          <h2>All Orders <span className="order-total-pill">{orders.length}</span></h2>
          <div className="aorders-controls">
            <input
              type="text"
              className="aorders-search"
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="status-filter">
              <button className={filterStatus === "all" ? "tab active" : "tab"} onClick={() => setFilterStatus("all")}>All</button>
              {ALL_STATUSES.map((s) => (
                <button key={s} className={filterStatus === s ? "tab active" : "tab"} onClick={() => setFilterStatus(s)}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="aorders-empty card">
            <div className="empty-icon">📦</div>
            <h3>{orders.length === 0 ? "No orders yet" : "No matching orders"}</h3>
            <p className="muted">{orders.length === 0 ? "Orders will appear here once customers start placing them." : "Try adjusting your search or filter."}</p>
          </div>
        )}

        <div className="aorders-list">
          {filtered.map((order) => {
            const product = getProduct(order.productId);
            const storeName = getStoreName(order.storeId);
            const isExp = expandedId === order.id;
            const statusColor = STATUS_COLORS[order.status] || "#a0aec0";

            return (
              <div key={order.id} className="aorder-card card">
                <div className="aorder-main">
                  {/* Thumb */}
                  <div className="aorder-thumb">
                    {product?.imageUrl ? (
                      <img src={product.imageUrl} alt={order.productName} className="aorder-thumb-img" />
                    ) : (
                      <div className="aorder-thumb-placeholder">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="aorder-info" onClick={() => setExpandedId(isExp ? null : order.id)}>
                    <h3 className="aorder-product-name">{order.productName}</h3>
                    <div className="aorder-meta-row">
                      <span className="aorder-store">{storeName}</span>
                      <span className="aorder-dot">·</span>
                      <span className="aorder-price">${Number(order.total || order.price || 0).toFixed(2)}</span>
                      <span className="aorder-dot">·</span>
                      <span className="aorder-qty">Qty: {order.quantity}</span>
                    </div>
                    <div className="aorder-address muted">{order.address}</div>
                    <div className="aorder-date muted">{new Date(order.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</div>
                  </div>

                  {/* Status + action */}
                  <div className="aorder-right">
                    <span className="status-badge" style={{ background: `${statusColor}22`, color: statusColor, borderColor: `${statusColor}55` }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => updateOrderStatus && updateOrderStatus(order.id, e.target.value)}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <button className="expand-btn" onClick={() => setExpandedId(isExp ? null : order.id)}>
                      {isExp ? "▲ Hide" : "▼ Details"}
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="aorder-detail">
                    <div className="adetail-grid">
                      <div><span className="dl">Order ID</span><span className="dv">{order.id}</span></div>
                      <div><span className="dl">Payment</span><span className="dv">{order.paymentMethod || "Cash on Delivery"}</span></div>
                      <div><span className="dl">Customer</span><span className="dv">{order.userName || order.userId || "—"}</span></div>
                      <div><span className="dl">Delivery address</span><span className="dv">{order.address}</span></div>
                      <div><span className="dl">Total</span><span className="dv adetail-total">${Number(order.total || order.price || 0).toFixed(2)}</span></div>
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
