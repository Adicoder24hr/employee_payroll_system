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

router.get('/summary', authorizeRoles('admin'), getPayrollSummary);

router.get('/me', getMyPayrollHistory);

router.get('/:employeeId/:month', getPayrollByEmployeeAndMonth);

module.exports = router;
