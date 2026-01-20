import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { orders, updateOrderStatus, deleteOrder } = useCart();
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="card dashboard-guest">
          <h2>Login to view your dashboard</h2>
          <p className="muted">Sign in to see your cart, comparison results, and admin orders.</p>
          <div className="actions">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-outline">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const myOrders = isAdmin ? orders : orders.filter((order) => order.customer === user?.name);

  const bestStoreLabel = (order) => {
    const found = order.storeComparisons?.find((s) => s.id === order.bestStoreId);
    return found?.name || order.bestStoreId || '—';
  };

  const stats = {
    total: myOrders.length,
    pending: myOrders.filter((o) => o.status === 'Pending').length,
    scanned: myOrders.filter((o) => o.status === 'Scanned').length,
    fulfilled: myOrders.filter((o) => o.status === 'Fulfilled').length,
  };

  const completedOrders = myOrders.filter((o) => o.status === 'Fulfilled');
  const activeOrders = myOrders.filter((o) => o.status !== 'Fulfilled');

  const statusOptions = ['Pending', 'Scanned', 'Fulfilled'];
  const [editingStatusId, setEditingStatusId] = useState(null);

  const handleDeleteClick = (orderId) => {
    setConfirmDelete(orderId);
  };

  const handleConfirmDelete = (orderId) => {
    deleteOrder(orderId);
    setConfirmDelete(null);
  };

  const renderOrderDetails = (order) => {
    if (!order || !order.address) return null;
    return (
      <div className="order-details-modal" onClick={() => setShowOrderDetails(null)}>
        <div className="details-box" onClick={(e) => e.stopPropagation()}>
          <div className="details-head">
            <h3>Order Details - {order.id}</h3>
            <button className="close-btn" onClick={() => setShowOrderDetails(null)}>×</button>
          </div>
          <div className="details-body">
            <div className="details-section">
              <strong>Shipping Address</strong>
              <p>
                {order.address.name || 'N/A'}<br />
                {order.address.address || 'N/A'}<br />
                {order.address.city || ''} {order.address.zip || ''}<br />
                {order.address.phone ? `Phone: ${order.address.phone}` : ''}
              </p>
            </div>
            <div className="details-section">
              <strong>Payment Method</strong>
              <p>{order.paymentMethod?.toUpperCase() || 'Not specified'}</p>
              {order.paymentNote && (
                <>
                  <strong style={{ marginTop: '0.5rem', display: 'block' }}>Payment Notes</strong>
                  <p>{order.paymentNote}</p>
                </>
              )}
            </div>
            <div className="details-section">
              <strong>Order Items</strong>
              {order.items.map((item) => (
                <div key={item.id} className="item-detail">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="details-footer">
              <button className="btn btn-outline" onClick={() => setShowOrderDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">{isAdmin ? 'Admin dashboard' : 'Your dashboard'}</p>
          <h1>Hello, {user?.name || 'User'}.</h1>
          <p className="muted">{isAdmin ? 'Monitor every checkout and mark them fulfilled.' : 'Review your latest cart checkouts and keep comparing.'}</p>
        </div>
        <Link to="/products" className="btn btn-primary">Go to products</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="label">Orders</span>
          <strong>{stats.total}</strong>
          <p className="muted">Total checkouts saved</p>
        </div>
        <div className="stat-card">
          <span className="label">Pending</span>
          <strong>{stats.pending}</strong>
          <p className="muted">Awaiting review</p>
        </div>
        <div className="stat-card">
          <span className="label">Scanned</span>
          <strong>{stats.scanned}</strong>
          <p className="muted">Under admin review</p>
        </div>
        <div className="stat-card">
          <span className="label">Fulfilled</span>
          <strong>{stats.fulfilled}</strong>
          <p className="muted">Marked complete</p>
        </div>
      </div>

      <div className="card orders-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">{isAdmin ? 'All carts' : 'Your carts'}</p>
            <h2>{isAdmin ? 'Active Orders' : 'Recent checkouts'}</h2>
          </div>
        </div>

        {!activeOrders.length && <p className="muted">No active orders yet. Add products and checkout to populate this table.</p>}

        {activeOrders.length > 0 && (
          <div className="orders-table">
            <div className="orders-header">
              <span>ID</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Chosen store</span>
              <span>Status</span>
              {isAdmin && <span>Details</span>}
              {isAdmin && <span>Action</span>}
              <span></span>
            </div>
            {activeOrders.map((order) => (
              <div key={order.id} className="orders-row">
                <span className="bold">{order.id}</span>
                <span>{order.customer}</span>
                <span>{order.items.length}</span>
                <span>{order.selectedStoreName || bestStoreLabel(order)}</span>
                {isAdmin ? (
                  <span
                    className={`status ${order.status.toLowerCase()}`}
                    role="button"
                    onClick={() => setEditingStatusId(order.id)}
                  >
                    {order.status}
                  </span>
                ) : (
                  <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                )}
                {isAdmin && (
                  <button className="btn btn-text" onClick={() => setShowOrderDetails(order.id)}>
                    Click to show details
                  </button>
                )}
                {isAdmin && (
                  <div className="actions">
                    {editingStatusId === order.id ? (
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => {
                          updateOrderStatus(order.id, e.target.value);
                          setEditingStatusId(null);
                        }}
                        onBlur={() => setEditingStatusId(null)}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <button className="btn btn-outline" onClick={() => setEditingStatusId(order.id)}>
                        Change status
                      </button>
                    )}
                  </div>
                )}
                {!isAdmin && (
                  <button className="btn btn-text btn-danger" onClick={() => handleDeleteClick(order.id)}>
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {completedOrders.length > 0 && (
        <div className="card orders-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">History</p>
              <h2>Completed Orders</h2>
            </div>
          </div>
          <div className="orders-table">
            <div className="orders-header">
              <span>ID</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Chosen store</span>
              <span>Total</span>
              {isAdmin && <span>Details</span>}
              <span></span>
            </div>
            {completedOrders.map((order) => (
              <div key={order.id} className="orders-row">
                <span className="bold">{order.id}</span>
                <span>{order.customer}</span>
                <span>{order.items.length}</span>
                <span>{order.selectedStoreName || bestStoreLabel(order)}</span>
                <span>${order.selectedStoreTotal?.toFixed(2) || '0.00'}</span>
                {isAdmin && (
                  <button className="btn btn-text" onClick={() => setShowOrderDetails(order.id)}>
                    Click to show details
                  </button>
                )}
                <div className="actions">
                  <button className="btn btn-text btn-danger" onClick={() => handleDeleteClick(order.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showOrderDetails && renderOrderDetails(myOrders.find((o) => o.id === showOrderDetails))}

      {confirmDelete && (
        <div className="confirmation-modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm {isAdmin ? 'Delete' : 'Cancellation'}</h3>
            <p>Are you sure you want to {isAdmin ? 'delete' : 'cancel'} this order? This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>
                No, keep it
              </button>
              <button className="btn btn-danger" onClick={() => handleConfirmDelete(confirmDelete)}>
                Yes, {isAdmin ? 'delete' : 'cancel'} it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
