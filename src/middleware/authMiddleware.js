/**
 * JWT Authentication Middleware
 * Protects routes by verifying the Bearer token in the Authorization header.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @middleware protect
 * Verifies JWT, attaches req.user, and calls next().
 * Returns 401 if token is missing or invalid.
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid authentication token.'
    });
  }
};

module.exports = { protect };
