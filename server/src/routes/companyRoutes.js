const express = require('express');
const { getMyCompany, updateWorkingDays } = require('../controllers/companyController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All company routes require authentication
router.use(authenticate);

// Get current tenant company metadata
router.get('/me', getMyCompany);

// Admin-only: update working days config
router.put('/me/working-days', authorizeRoles('admin'), updateWorkingDays);

module.exports = router;
