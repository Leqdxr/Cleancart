/**
 * Cart Context
 * Manages shopping cart, orders, products, and price comparison logic
 * Persists data to localStorage for session continuity
 * Provides cart operations, checkout flow, and admin product management
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { stores } from '../data/catalog';

// Create cart context for global state management
const CartContext = createContext();

/**
 * Load data from localStorage with JSON parsing
 * @param {string} key - localStorage key
 * @param {*} fallback - Default value if key not found or parse fails
 * @returns {*} Parsed value or fallback
 */
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Save data to localStorage as JSON string
 * @param {string} key - localStorage key
 * @param {*} value - Value to persist
 */
const persist = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

/**
 * Cart Provider Component
 * Wraps application to provide cart state and operations
 *
 * Manages:
 * - Shopping cart items (add, remove, update quantity)
 * - Order history and checkout
 * - Product catalog (admin CRUD)
 * - Price comparison matrix across stores
 */
export const CartProvider = ({ children }) => {
  // Cart items array: [{ productId, quantity }]
  const [cart, setCart] = useState(() => load('cc_cart', []));
  // Order history array sorted newest first
  const [orders, setOrders] = useState(() => load('cc_orders', []));
  // Dynamic products managed by admin, stored in localStorage
  const [products, setProducts] = useState(() => load('cc_products', []));

  // Persist state changes to localStorage automatically
  useEffect(() => { persist('cc_cart', cart); }, [cart]);
  useEffect(() => { persist('cc_orders', orders); }, [orders]);
  useEffect(() => { persist('cc_products', products); }, [products]);

  /**
   * Add a product to the cart
   * Increments quantity if product already exists, otherwise adds new entry
   * @param {string} productId - Product ID to add
   */
  const addToCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        // Product already in cart — increment quantity
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // New product — add with quantity 1
      return [...prev, { productId, quantity: 1 }];
    });
  };

  /**
   * Remove a product entirely from the cart
   * @param {string} productId - Product ID to remove
   */
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  /**
   * Update the quantity of a product in the cart
   * Removes product if quantity drops to zero or below
   * @param {string} productId - Product ID to update
   * @param {number} quantity - New quantity value
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) =>
      prev.map((item) => item.productId === productId ? { ...item, quantity } : item)
    );
  };

  /** Clear all items from the cart */
  const clearCart = () => setCart([]);

  /**
   * Add a new product to the catalog (admin function)
   * Generates a unique ID using timestamp
   * @param {Object} product - Product data (name, description, category, imageUrl, stores)
   * @returns {Object} Created product with generated ID
   */
  const addProduct = (product) => {
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  /**
   * Delete a product from the catalog (admin function)
   * Also removes the product from any user's cart
   * @param {string} productId - Product ID to delete
   */
  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    // Also remove from cart if present
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  /**
   * Price comparison matrix — computes total cost per store for all cart items
   * Includes delivery fees, availability tracking, and missing item counts
   * Recalculates whenever cart or products change
   */
  const priceMatrix = useMemo(() => {
    // Initialize each store with its delivery fee as the base total
    const totals = stores.map((store) => ({
      ...store,
      total: store.deliveryFee,
      unavailable: [],
      items: [],
    }));

    // Calculate totals for each cart item across all stores
    cart.forEach((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) return;
      totals.forEach((storeTotal) => {
        const storeData = product.stores?.[storeTotal.id];
        if (storeData?.available) {
          // Product available at this store — add to total
          storeTotal.items.push({ ...product, quantity: entry.quantity, price: storeData.price });
          storeTotal.total += storeData.price * entry.quantity;
        } else {
          // Product not available — track as missing
          storeTotal.unavailable.push(product.name);
        }
      });
    });

    // Return enriched store data with rounded totals and counts
    return totals.map((store) => ({
      ...store,
      total: Number(store.total.toFixed(2)),
      availableCount: store.items.length,
      missingCount: store.unavailable.length,
    }));
  }, [cart, products]);

  /**
   * Checkout entire cart — creates an order from all cart items
   * Selects the best store (cheapest with all items) or uses the provided storeId
   * @param {Object} options - Checkout options
   * @param {Object} options.user - Current user info
   * @param {string} options.storeId - Preferred store ID
   * @param {string} options.address - Delivery address
   * @param {string} options.paymentMethod - Payment method (e.g., 'cod')
   * @param {string} options.paymentNote - Optional payment note
   * @returns {Object|null} Created order or null if cart is empty
   */
  const checkoutCart = ({ user = {}, storeId, address, paymentMethod, paymentNote }) => {
    if (!cart.length) return null;

    const bestStore = priceMatrix
      .filter((s) => s.missingCount === 0)
      .sort((a, b) => a.total - b.total)[0];

    const chosenStore = priceMatrix.find((s) => s.id === storeId) || bestStore;

    const enrichedItems = cart.map((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      return { ...product, quantity: entry.quantity };
    });

    const totalQty = enrichedItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const displayName = enrichedItems.length === 1
      ? enrichedItems[0]?.name
      : `${enrichedItems.length} items`;

    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      productId: enrichedItems[0]?.id || null,
      productName: displayName,
      storeId: chosenStore?.id || null,
      quantity: totalQty,
      price: chosenStore?.total ? (chosenStore.total - (chosenStore.deliveryFee || 0)) / Math.max(totalQty, 1) : 0,
      total: chosenStore?.total || 0,
      address,
      paymentMethod: paymentMethod || 'cod',
      paymentNote: paymentNote || '',
      status: 'pending',
      // Legacy / expanded fields
      customer: user?.name || 'Guest',
      customerEmail: user?.email || '-',
      items: enrichedItems,
      storeComparisons: priceMatrix,
      bestStoreId: bestStore?.id || null,
      bestStoreName: bestStore?.name || null,
      selectedStoreId: chosenStore?.id || null,
      selectedStoreName: chosenStore?.name || null,
      selectedStoreTotal: chosenStore?.total || null,
      selectedStoreDelivery: chosenStore?.deliveryFee || null,
    };

    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  /**
   * Single-product checkout — creates order for one product from product detail page
   * Calculates total including delivery cost for the selected store
   * @param {Object} options - Checkout options
   * @param {Object} options.user - Current user info
   * @param {string} options.productId - Product to purchase
   * @param {string} options.storeId - Selected store
   * @param {number} options.quantity - Quantity to order (default: 1)
   * @param {string} options.address - Delivery address
   * @param {string} options.paymentMethod - Payment method
   * @returns {Object|null} Created order or null if product/store not found
   */
  const checkoutSingleProduct = ({ user = {}, productId, storeId, quantity = 1, address, paymentMethod }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    const store = stores.find((s) => s.id === storeId);
    const storeData = product.stores?.[storeId];
    if (!storeData || !store) return null;

    const itemTotal = storeData.price * quantity;
    const deliveryCost = storeData.deliveryCost ?? store.deliveryFee;
    const orderTotal = itemTotal + deliveryCost;

    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      productId: product.id,
      productName: product.name,
      storeId,
      quantity,
      price: storeData.price,
      total: orderTotal,
      address,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending',
      // Legacy / expanded fields
      customer: user?.name || 'Guest',
      customerEmail: user?.email || '-',
      items: [{ ...product, quantity, price: storeData.price }],
      selectedStoreId: storeId,
      selectedStoreName: store.name,
      selectedStoreTotal: orderTotal,
      selectedStoreDelivery: deliveryCost,
      paymentNote: '',
    };

    setOrders((prev) => [order, ...prev]);
    return order;
  };

  /**
   * Update the status of an order (admin function)
   * @param {string} orderId - Order ID to update
   * @param {string} nextStatus - New status (pending/processing/shipped/delivered/cancelled)
   * @returns {Object} The order before status change (for notification triggers)
   */
  const updateOrderStatus = (orderId, nextStatus) => {
    const order = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o)
    );
    // Return the order so callers can trigger notifications
    return order;
  };

  /**
   * Delete an order from history
   * @param {string} orderId - Order ID to remove
   */
  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Context value providing all cart operations to consumers
  const value = {
    cart,
    products,
    stores,
    priceMatrix,
    orders,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkoutCart,
    checkoutSingleProduct,
    updateOrderStatus,
    deleteOrder,
    addProduct,
    deleteProduct,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Custom hook to access cart context
 * Must be used within CartProvider
 * @returns {Object} Cart context value with all cart operations
 * @throws {Error} If used outside CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};


