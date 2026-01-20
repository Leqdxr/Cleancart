const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: messages });
    }
    
    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Handle database connection errors
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      return res.status(500).json({ error: 'Database connection failed. Please check if PostgreSQL is running.' });
    }
    
    // Generic error with more details in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Registration failed. Please try again.';
    res.status(500).json({ error: errorMessage });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle database connection errors
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      return res.status(500).json({ error: 'Database connection failed. Please check if PostgreSQL is running.' });
    }
    
    // Generic error with more details in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Login failed. Please try again.';
    res.status(500).json({ error: errorMessage });
  }
};
