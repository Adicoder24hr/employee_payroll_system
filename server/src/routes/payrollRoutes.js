const express = require('express');
const { body } = require('express-validator');
const {
  calculateAndSavePayroll,
  getPayrollByEmployeeAndMonth,
  getMyPayrollHistory,
  getPayrollSummary,
} = require('../controllers/payrollController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.use(authenticate);

// Admin-only: Calculate and upsert monthly payroll
router.post(
  '/calculate',
  authorizeRoles('admin'),
  [
    body('employeeId').isMongoId().withMessage('Valid employeeId is required'),
    body('month')
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('Month must be in YYYY-MM format'),
    body('attendance.present')
      .isFloat({ min: 0 })
      .withMessage('Present days cannot be negative'),
    body('attendance.absent')
      .isFloat({ min: 0 })
      .withMessage('Absent days cannot be negative'),
    body('attendance.halfDay')
      .isFloat({ min: 0 })
      .withMessage('Half days cannot be negative'),
    handleValidationErrors,
  ],
  calculateAndSavePayroll
);

// Admin-only: Summary metrics and dashboard aggregation
router.get('/summary', authorizeRoles('admin'), getPayrollSummary);

// Authenticated: Employee view their own history
router.get('/me', getMyPayrollHistory);

// Authenticated: Get payroll for specific employee & month (Admin or self)
router.get('/:employeeId/:month', getPayrollByEmployeeAndMonth);

module.exports = router;
