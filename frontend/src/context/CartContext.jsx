import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as productCatalog, stores } from '../data/catalog';

const CartContext = createContext();

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key} from storage`, err);
    return fallback;
  }
};

const persist = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist ${key}`, err);
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => load('cart', []));
  const [orders, setOrders] = useState(() => load('orders', []));

  useEffect(() => {
    persist('cart', cart);
  }, [cart]);

  useEffect(() => {
    persist('orders', orders);
  }, [orders]);

  const addToCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

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

  const clearCart = () => setCart([]);

  const priceMatrix = useMemo(() => {
    const totals = stores.map((store) => ({
      ...store,
      total: store.deliveryFee,
      unavailable: [],
      items: [],
    }));

    cart.forEach((entry) => {
      const product = productCatalog.find((p) => p.id === entry.productId);
      if (!product) return;

      totals.forEach((storeTotal) => {
        const offer = product.pricing[storeTotal.id];
        if (offer && offer.available) {
          storeTotal.items.push({ ...product, quantity: entry.quantity, price: offer.price });
          storeTotal.total += offer.price * entry.quantity;
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
  }, [cart]);

  const checkoutCart = ({ user = {}, storeId, address, paymentMethod, paymentNote }) => {
    if (!cart.length) return null;

    const bestStore = priceMatrix
      .filter((store) => store.missingCount === 0)
      .sort((a, b) => a.total - b.total)[0];

    const chosenStore = priceMatrix.find((s) => s.id === storeId) || bestStore;

    const enrichedItems = cart.map((entry) => {
      const product = productCatalog.find((p) => p.id === entry.productId);
      return { ...product, quantity: entry.quantity };
    });

    const order = {
      id: `ORD-${Date.now()}`,
      placedAt: new Date().toISOString(),
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
      paymentMethod: paymentMethod || 'cod',
      paymentNote: paymentNote || '',
      address,
      status: 'Pending',
    };

    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
