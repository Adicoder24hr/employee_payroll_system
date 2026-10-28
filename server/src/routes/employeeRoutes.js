const express = require('express');
const { body } = require('express-validator');
const {
  listEmployees,
  createEmployee,
  getEmployeeById,
} = require('../controllers/employeeController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.use(authenticate);

router.get('/', authorizeRoles('admin'), listEmployees);

router.post(
  '/',
  authorizeRoles('admin'),
  [
    body('name').trim().notEmpty().withMessage('Employee name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('monthlySalary')
      .isFloat({ min: 0 })
      .withMessage('Monthly salary must be a non-negative number'),
    body('role')
      .optional()
      .isIn(['admin', 'employee'])
      .withMessage('Role must be either admin or employee'),
    handleValidationErrors,
  ],
  createEmployee
);

router.get('/:id', getEmployeeById);

module.exports = router;
