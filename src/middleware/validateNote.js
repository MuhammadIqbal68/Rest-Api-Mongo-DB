/**
 * Middleware for validating note creation and update requests
 */

const validateCreateNote = (req, res, next) => {
  const { title, content, category, tags } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push("Title is required and cannot be empty.");
  } else if (title.length > 150) {
    errors.push("Title cannot exceed 150 characters.");
  }

  // Content validation (optional, but must be string if provided)
  if (content !== undefined && typeof content !== 'string') {
    errors.push("Content must be a string.");
  }

  // Category validation (optional)
  if (category !== undefined && typeof category !== 'string') {
    errors.push("Category must be a string.");
  }

  // Tags validation (optional)
  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push("Tags must be an array of strings.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      statusCode: 400,
      details: errors
    });
  }

  next();
};

const validateUpdateNote = (req, res, next) => {
  const { title, content, category, tags } = req.body;
  const errors = [];

  // Check if body is empty
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      statusCode: 400,
      details: ["Request body cannot be empty for updates."]
    });
  }

  // Title validation (if provided)
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push("Title cannot be empty.");
    } else if (title.length > 150) {
      errors.push("Title cannot exceed 150 characters.");
    }
  }

  // Content validation
  if (content !== undefined && typeof content !== 'string') {
    errors.push("Content must be a string.");
  }

  // Category validation
  if (category !== undefined && typeof category !== 'string') {
    errors.push("Category must be a string.");
  }

  // Tags validation
  if (tags !== undefined && !Array.isArray(tags)) {
    errors.push("Tags must be an array of strings.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      statusCode: 400,
      details: errors
    });
  }

  next();
};

module.exports = {
  validateCreateNote,
  validateUpdateNote
};
