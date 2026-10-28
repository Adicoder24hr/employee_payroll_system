const express = require('express');
const { getMyCompany, updateWorkingDays } = require('../controllers/companyController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me', getMyCompany);

router.put('/me/working-days', authorizeRoles('admin'), updateWorkingDays);

module.exports = router;
