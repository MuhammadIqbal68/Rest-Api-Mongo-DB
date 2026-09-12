/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT for a given user ID.
 * @param {string} id - MongoDB user ObjectId
 * @returns {string} Signed JWT string
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Basic field presence check
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Validation Error',
        message: 'Username, email, and password are all required.'
      });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: 'An account with that email already exists.'
      });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        error: 'Conflict',
        message: 'That username is already taken.'
      });
    }

    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user record
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Issue JWT
    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic field presence check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: 'Validation Error',
        message: 'Email and password are required.'
      });
    }

    // Fetch user with password (normally excluded via select: false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    // Verify password against stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    // Issue JWT
    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Return authenticated user's profile
 * @access  Protected
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: req.user
  });
};

module.exports = { register, login, getMe };
