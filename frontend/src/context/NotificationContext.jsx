/**
 * Notification Context
 * Manages notifications for users and admin
 * Stores notifications in localStorage
 * Supports auto-notifications on order status changes and admin-sent notifications
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const NotificationContext = createContext();

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

const NOTIFICATION_ICONS = {
  order: '📦',
  shipped: '🚚',
  delivered: '✅',
  cancelled: '❌',
  discount: '🏷️',
  info: 'ℹ️',
  admin: '🛡️',
  welcome: '👋',
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => load('cc_notifications', []));

  useEffect(() => {
    persist('cc_notifications', notifications);
  }, [notifications]);

  /**
   * Add a new notification
   * @param {Object} options
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification body
   * @param {string} options.type - Type: order|shipped|delivered|cancelled|discount|info|admin|welcome
   * @param {string|number} options.userId - Target user ID (null for broadcast)
   * @param {string} options.userEmail - Target user email (null for broadcast)
   */
  const addNotification = useCallback(({ title, message, type = 'info', userId = null, userEmail = null }) => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      message,
      type,
      icon: NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.info,
      userId,
      userEmail,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notification, ...prev]);
    return notification;
  }, []);

  /**
   * Auto-notify on order status change
   */
  const notifyOrderStatusChange = useCallback((order, newStatus) => {
    const statusMessages = {
      processing: { title: 'Order Processing', message: `Your order "${order.productName}" is now being processed.` },
      shipped: { title: 'Order Shipped! 🚚', message: `Great news! Your order "${order.productName}" has been shipped and is on its way.` },
      delivered: { title: 'Order Delivered! ✅', message: `Your order "${order.productName}" has been delivered. Enjoy your purchase!` },
      cancelled: { title: 'Order Cancelled', message: `Your order "${order.productName}" has been cancelled.` },
    };

    const info = statusMessages[newStatus];
    if (info) {
      addNotification({
        title: info.title,
        message: info.message,
        type: newStatus === 'shipped' ? 'shipped' : newStatus === 'delivered' ? 'delivered' : newStatus === 'cancelled' ? 'cancelled' : 'order',
        userId: order.userId,
        userEmail: order.userEmail || order.customerEmail,
      });
    }
  }, [addNotification]);

  /**
   * Admin sends a broadcast or targeted notification
   */
  const sendAdminNotification = useCallback(({ title, message, userId = null, userEmail = null, type = 'admin' }) => {
    addNotification({ title, message, type, userId, userEmail });
  }, [addNotification]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  /**
   * Mark all notifications as read for a specific user
   */
  const markAllAsRead = useCallback((userId, userEmail) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const isBroadcast = !n.userId && !n.userEmail;
        const matchesUserId = n.userId != null && userId != null && String(n.userId) === String(userId);
        const matchesEmail = n.userEmail && userEmail && n.userEmail === userEmail;
        const isForUser = isBroadcast || matchesUserId || matchesEmail;
        return isForUser ? { ...n, read: true } : n;
      })
    );
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback((notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Get notifications for a specific user (includes broadcasts)
   */
  const getNotificationsForUser = useCallback((userId, userEmail) => {
    return notifications.filter((n) => {
      // Broadcast notifications (no specific target) go to everyone
      const isBroadcast = !n.userId && !n.userEmail;
      // Targeted by userId (loose comparison to handle string/number mismatch)
      const matchesUserId = n.userId != null && userId != null && String(n.userId) === String(userId);
      // Targeted by email
      const matchesEmail = n.userEmail && userEmail && n.userEmail === userEmail;
      return isBroadcast || matchesUserId || matchesEmail;
    });
  }, [notifications]);

  /**
   * Get unread count for a specific user
   */
  const getUnreadCount = useCallback((userId, userEmail) => {
    return getNotificationsForUser(userId, userEmail).filter((n) => !n.read).length;
  }, [getNotificationsForUser]);

  const value = {
    notifications,
    addNotification,
    notifyOrderStatusChange,
    sendAdminNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsForUser,
    getUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
