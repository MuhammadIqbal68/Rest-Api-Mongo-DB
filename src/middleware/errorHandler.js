/**
 * Centralized Error Handling Middleware
 */

const mongoose = require('mongoose');

// Handle 404 for unmatched routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Resource Not Found",
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

// Global error handler for uncaught exceptions, invalid JSON, and Mongoose errors
const globalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  // JSON syntax error from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      statusCode: 400,
      message: "Malformed JSON syntax in request body."
    });
  }

  // Mongoose CastError — invalid ObjectId format
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      statusCode: 404,
      message: `Resource with ID '${err.value}' was not found.`
    });
  }

  // Mongoose ValidationError — schema validation failure
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      statusCode: 400,
      details
    });
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate Key Error",
      statusCode: 400,
      message: "A record with that value already exists."
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.name || "Internal Server Error",
    statusCode,
    message: err.message || "An unexpected error occurred on the server."
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
