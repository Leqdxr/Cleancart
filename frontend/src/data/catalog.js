/**
 * Static store definitions
 * Products are now managed dynamically by admins via the ManageProducts page
 * and stored in localStorage under the key 'cc_products'.
 */

export const stores = [
  {
    id: 'techmart',
    name: 'TechMart',
    logo: '🛍️',
    deliveryFee: 3.99,
    eta: '2-4 days',
    rating: 4.6,
  },
  {
    id: 'gearhub',
    name: 'GearHub',
    logo: '⚡',
    deliveryFee: 2.49,
    eta: 'Next day',
    rating: 4.4,
  },
  {
    id: 'proshop',
    name: 'ProShop',
    logo: '💼',
    deliveryFee: 4.5,
    eta: '3-5 days',
    rating: 4.7,
  },
];

// Kept for backwards compatibility but products come from localStorage
export const products = [];


