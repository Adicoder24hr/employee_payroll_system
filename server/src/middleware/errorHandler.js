function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(`[Error] ${req.method} ${req.url}:`, err);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for parameter: ${err.path}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `Duplicate value entered for ${field}. Please use another value.`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'An unexpected server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
