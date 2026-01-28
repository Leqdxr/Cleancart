/**
 * Cart Context
 * Manages shopping cart state, price comparisons across stores, and order management
 * Persists cart and orders to localStorage
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as productCatalog, stores } from '../data/catalog';

// Create cart context
const CartContext = createContext();

/**
 * Load data from localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} fallback - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or fallback
 */
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key} from storage`, err);
    return fallback;
  }
};

/**
 * Save data to localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} value - Value to stringify and save
 */
const persist = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist ${key}`, err);
  }
};

/**
 * Cart Provider Component
 * Provides cart functionality and price comparison across stores
 * 
 * Context value includes:
 * - cart: Array of cart items {productId, quantity}
 * - products: Product catalog
 * - stores: Available stores
 * - priceMatrix: Price comparison across all stores
 * - orders: User's order history
 * - addToCart: Add product to cart
 * - removeFromCart: Remove product from cart
 * - updateQuantity: Update product quantity
 * - clearCart: Empty cart
 * - checkoutCart: Place order and clear cart
 * - updateOrderStatus: Update order status
 * - deleteOrder: Delete order from history
 */
export const CartProvider = ({ children }) => {
  // Cart state: [{productId, quantity}, ...]
  const [cart, setCart] = useState(() => load('cart', []));
  
  // Orders state: Array of order objects
  const [orders, setOrders] = useState(() => load('orders', []));

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    persist('cart', cart);
  }, [cart]);

  // Persist orders to localStorage whenever they change
  useEffect(() => {
    persist('orders', orders);
  }, [orders]);

  /**
   * Add product to cart or increment quantity if already exists
   * @param {number} productId - ID of product to add
   */
  const addToCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        // Increment quantity if product already in cart
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new product with quantity 1
      return [...prev, { productId, quantity: 1 }];
    });
  };

  /**
   * Remove product from cart completely
   * @param {number} productId - ID of product to remove
   */
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  /**
   * Update product quantity in cart
   * Removes product if quantity <= 0
   * @param {number} productId - ID of product
   * @param {number} quantity - New quantity
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => setCart([]);

  /**
   * Calculate price comparison matrix across all stores
   * Computes total price, delivery fees, and product availability for each store
   * Memoized to prevent unnecessary recalculations
   */
  const priceMatrix = useMemo(() => {
    // Initialize totals for each store
    const totals = stores.map((store) => ({
      ...store,
      total: store.deliveryFee, // Start with delivery fee
      unavailable: [], // Products not available at this store
      items: [], // Available products with prices
    }));

    // Calculate totals for each cart item across all stores
    cart.forEach((entry) => {
      const product = productCatalog.find((p) => p.id === entry.productId);
      if (!product) return;

      totals.forEach((storeTotal) => {
        const offer = product.pricing[storeTotal.id];
        if (offer && offer.available) {
          // Product available - add to items and total
          storeTotal.items.push({ ...product, quantity: entry.quantity, price: offer.price });
          storeTotal.total += offer.price * entry.quantity;
        } else {
          // Product not available - add to unavailable list
          storeTotal.unavailable.push(product.name);
        }
      });
    });

    // Format and return price matrix with calculated totals
    return totals.map((store) => ({
      ...store,
      total: Number(store.total.toFixed(2)),
      availableCount: store.items.length,
      missingCount: store.unavailable.length,
    }));
  }, [cart]);

  /**
   * Checkout cart and create order
   * Selects best store (lowest total) or allows manual store selection
   * Clears cart after successful checkout
   * 
   * @param {Object} params - Checkout parameters
   * @param {Object} params.user - User information
   * @param {string} params.storeId - Manually selected store ID (optional)
   * @param {string} params.address - Delivery address
   * @param {string} params.paymentMethod - Payment method (e.g., 'cod', 'card')
   * @param {string} params.paymentNote - Additional payment notes
   * @returns {Object|null} Created order object or null if cart is empty
   */
  const checkoutCart = ({ user = {}, storeId, address, paymentMethod, paymentNote }) => {
    if (!cart.length) return null;

    // Find best store (lowest total) with all products available
    const bestStore = priceMatrix
      .filter((store) => store.missingCount === 0)
      .sort((a, b) => a.total - b.total)[0];

    // Use manually selected store or default to best store
    const chosenStore = priceMatrix.find((s) => s.id === storeId) || bestStore;

    // Enrich cart items with full product details
    const enrichedItems = cart.map((entry) => {
      const product = productCatalog.find((p) => p.id === entry.productId);
      return { ...product, quantity: entry.quantity };
    });

    // Create order object with all details
    const order = {
      id: `ORD-${Date.now()}`, // Unique order ID
      placedAt: new Date().toISOString(), // Order timestamp
      customer: user?.name || 'Guest',
      customerEmail: user?.email || '-',
      items: enrichedItems,
      storeComparisons: priceMatrix, // Price comparison for reference
      bestStoreId: bestStore?.id || null,
      bestStoreName: bestStore?.name || null,
      selectedStoreId: chosenStore?.id || null,
      selectedStoreName: chosenStore?.name || null,
      selectedStoreTotal: chosenStore?.total || null,
      selectedStoreDelivery: chosenStore?.deliveryFee || null,
      paymentMethod: paymentMethod || 'cod',
      paymentNote: paymentNote || '',
      address,
      status: 'Pending', // Initial order status
    };

    // Add order to history and clear cart
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  /**
   * Update order status
   * @param {string} orderId - Order ID to update
   * @param {string} nextStatus - New status (e.g., 'Pending', 'Shipped', 'Delivered')
   */
  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );
  };

  /**
   * Delete order from history
   * @param {string} orderId - Order ID to delete
   */
  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  // Context value provided to children
  const value = {
    cart,
    products: productCatalog,
    stores,
    priceMatrix,
    orders,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkoutCart,
    updateOrderStatus,
    deleteOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Custom hook to access cart context
 * Must be used within CartProvider
 * @returns {Object} Cart context value
 * @throws {Error} If used outside CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
