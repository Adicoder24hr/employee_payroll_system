const express = require('express');
const { body } = require('express-validator');
const { askPayrollQuestion } = require('../controllers/askController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('question').trim().notEmpty().withMessage('Question string is required'),
    handleValidationErrors,
  ],
  askPayrollQuestion
);

module.exports = router;
