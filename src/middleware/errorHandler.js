/**
 * Centralized Error Handling Middleware
 */

// Handle 404 for unmatched routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Resource Not Found",
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

// Global error handler for uncaught exceptions or invalid JSON body payloads
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
