/**
 * Main server file for CleanCart backend application
 * Sets up Express server, database connection, and API routes
 */

// Import required dependencies
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');

// Initialize Express application
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api/auth', require('./routes/authRoutes')); // Authentication routes (register, login, profile)
app.use('/api/admin', require('./routes/adminRoutes')); // Admin management routes (user CRUD)

// Test route to verify backend is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Server configuration
const PORT = process.env.PORT || 5000;

/**
 * Initialize and start the server
 * - Syncs database schema with models
 * - Starts Express server on specified port
 */
const startServer = async () => {
  try {
    // Sync database (create/update tables based on models)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

// Start the server
startServer();
