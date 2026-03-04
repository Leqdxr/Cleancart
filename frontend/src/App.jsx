/**
 * Main Application Component
 * Sets up routing, authentication, and cart functionality
 * Wraps entire app with necessary context providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageProducts from './pages/ManageProducts';
import './App.css';

/**
 * App Component
 * Establishes application structure with:
 * - AuthProvider: Manages user authentication state
 * - CartProvider: Manages shopping cart and orders
 * - Router: Handles client-side routing
 * - Navbar: Persistent navigation component
 * - Routes: All application pages
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute adminOnly><ManageProducts /></ProtectedRoute>} />
              </Routes>
              <Footer />
            </div>
            </Router>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
