const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token - user not found' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Account is deactivated' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication failed' 
    });
  }
};

// Check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required role: ${userRoles.join(' or ')}` 
      });
    }
    
    next();
  };
};

// Check if user is instructor
const requireInstructor = requireRole(['instructor', 'admin']);

// Check if user is admin
const requireAdmin = requireRole('admin');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check ownership based on resource field
    const resourceUserId = req.resource && req.resource[resourceField];
    const paramUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    if (resourceUserId && resourceUserId.toString() !== currentUserId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only access your own resources' 
      });
    }
    
    if (paramUserId && paramUserId !== currentUserId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only access your own resources' 
      });
    }
    
    next();
  };
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d',
      issuer: 'virtual-learning-platform',
      audience: 'vlp-users'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '30d',
      issuer: 'virtual-learning-platform',
      audience: 'vlp-users'
    }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireInstructor,
  requireAdmin,
  optionalAuth,
  requireOwnershipOrAdmin,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};
