const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../config/database');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info(`Signup attempt for email: ${email}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn(`Signup failed - user already exists: ${email}`);
      return res.status(409).json({ 
        success: false,
        message: 'User already exists with this email address' 
      });
    }

    // Create new user
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password 
    });
    
    await user.save();
    logger.info(`User created successfully: ${user._id}`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified || false,
          role: user.role || 'user'
        }
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: 'User already exists with this email address' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during signup' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`Login attempt for email: ${email}`);

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      logger.warn(`Login failed - invalid password: ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    logger.info(`Login successful for user: ${user._id}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified || false,
          role: user.role || 'user',
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during login' 
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token type' 
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid refresh token' 
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid or expired refresh token' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

module.exports = router;