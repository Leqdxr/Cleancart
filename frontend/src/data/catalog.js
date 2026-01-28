/**
 * Product Catalog Data
 * 
 * Static data file containing:
 * - Store information (delivery fees, ETAs, ratings)
 * - Product catalog (computer accessories)
 * - Per-store pricing and availability
 * 
 * This data drives the price comparison engine in CartContext.
 * Products include specs, descriptions, and multi-store pricing.
 * 
 * Categories: Mice, Keyboards, Headsets, Docks, Monitors
 * Stores: TechMart, GearHub, ProShop
 */

/**
 * Available stores with delivery information
 * Each store has unique pricing for products
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

/**
 * Product catalog with multi-store pricing
 * Each product includes:
 * - Basic info (id, name, category, brand)
 * - Marketing (heroTag, description)
 * - Technical specs
 * - Pricing object with per-store price and availability
 */
export const products = [
  {
    id: 'mouse-pro',
    name: 'Logi Wireless Mouse',
    category: 'Mice',
    brand: 'Logi',
    heroTag: 'Best seller',
    description: 'Silent clicks, 24-month battery, multi-device pairing for creators and analysts.',
    specs: ['Silent clicks', 'Dual Bluetooth/USB', '24-month battery', 'Precision sensor'],
    pricing: {
      techmart: { price: 24.99, available: true },
      gearhub: { price: 22.49, available: true },
      proshop: { price: 25.99, available: true },
    },
  },
  {
    id: 'keyboard-low',
    name: 'Keylite Low-Profile Keyboard',
    category: 'Keyboards',
    brand: 'Keylite',
    heroTag: 'Ergo favorite',
    description: 'Low-profile mechanical feel with white backlight and aluminum top plate.',
    specs: ['Low-profile keys', 'White backlight', 'Aluminum top', 'USB-C detachable'],
    pricing: {
      techmart: { price: 59.99, available: true },
      gearhub: { price: 62.49, available: true },
      proshop: { price: 58.99, available: true },
    },
  },
  {
    id: 'headset-focus',
    name: 'Nimbus Focus Headset',
    category: 'Headsets',
    brand: 'Nimbus',
    heroTag: 'Calls & gaming',
    description: 'Hybrid ANC, dual mics, 35-hour battery with fast USB-C charging.',
    specs: ['Hybrid ANC', 'Dual beam mics', '35h battery', 'USB-C fast charge'],
    pricing: {
      techmart: { price: 79.99, available: true },
      gearhub: { price: 74.99, available: false },
      proshop: { price: 82.49, available: true },
    },
  },
  {
    id: 'monitor-27',
    name: 'AeroView 27" QHD Monitor',
    category: 'Monitors',
    brand: 'AeroView',
    heroTag: 'Creator pick',
    description: '27-inch QHD, 90% DCI-P3, 75Hz, USB-C with 65W power delivery.',
    specs: ['QHD 2560x1440', 'USB-C 65W', 'Adaptive sync', 'Factory calibrated'],
    pricing: {
      techmart: { price: 289.99, available: true },
      gearhub: { price: 299.0, available: true },
      proshop: { price: 0, available: false },
    },
  },
  {
    id: 'dock-usbc',
    name: 'Flex USB-C Dock',
    category: 'Accessories',
    brand: 'Flexio',
    heroTag: 'Desk essential',
    description: '7-in-1 hub with HDMI 4K, two USB 3.1 ports, SD reader, and 100W passthrough.',
    specs: ['HDMI 4K', '100W PD', 'Aluminum shell', 'Thermal vents'],
    pricing: {
      techmart: { price: 44.99, available: true },
      gearhub: { price: 0, available: false },
      proshop: { price: 41.49, available: true },
    },
  },
  {
    id: 'chair-ergonomic',
    name: 'Axis Ergo Chair',
    category: 'Chairs',
    brand: 'Axis',
    heroTag: 'Posture saver',
    description: 'Dynamic lumbar support, breathable mesh, 4D armrests, and tilt lock.',
    specs: ['Dynamic lumbar', '4D armrests', 'Mesh back', 'Tilt + height adjust'],
    pricing: {
      techmart: { price: 329.0, available: true },
      gearhub: { price: 315.5, available: true },
      proshop: { price: 0, available: false },
    },
  },
];
