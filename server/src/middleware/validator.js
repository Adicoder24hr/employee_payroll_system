const { validationResult } = require('express-validator');

/**
 * Middleware that checks for validation errors from express-validator
 * and returns a standardized 400 response if any errors exist.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
}

module.exports = {
  handleValidationErrors,
};
