import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { stores } from '../data/catalog';

const CartContext = createContext();

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => load('cc_cart', []));
  const [orders, setOrders] = useState(() => load('cc_orders', []));
  // Dynamic products managed by admin, stored in localStorage
  const [products, setProducts] = useState(() => load('cc_products', []));

  useEffect(() => { persist('cc_cart', cart); }, [cart]);
  useEffect(() => { persist('cc_orders', orders); }, [orders]);
  useEffect(() => { persist('cc_products', products); }, [products]);

  const addToCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) =>
      prev.map((item) => item.productId === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCart([]);

  // Admin product management
  const addProduct = (product) => {
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    // Also remove from cart if present
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const priceMatrix = useMemo(() => {
    const totals = stores.map((store) => ({
      ...store,
      total: store.deliveryFee,
      unavailable: [],
      items: [],
    }));

    cart.forEach((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) return;
      totals.forEach((storeTotal) => {
        const storeData = product.stores?.[storeTotal.id];
        if (storeData?.available) {
          storeTotal.items.push({ ...product, quantity: entry.quantity, price: storeData.price });
          storeTotal.total += storeData.price * entry.quantity;
        } else {
          storeTotal.unavailable.push(product.name);
        }
      });
    });

    return totals.map((store) => ({
      ...store,
      total: Number(store.total.toFixed(2)),
      availableCount: store.items.length,
      missingCount: store.unavailable.length,
    }));
  }, [cart, products]);

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

  // Single-product checkout (used from product detail page)
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

  const updateOrderStatus = (orderId, nextStatus) => {
    const order = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o)
    );
    // Return the order so callers can trigger notifications
    return order;
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};


