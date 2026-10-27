const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

// Rate limiter for authentication endpoint (15 attempts per 15 mins per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login route
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
  ],
  login
);

// Get current user profile
router.get('/me', authenticate, getMe);

module.exports = router;
