const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

startServer();
