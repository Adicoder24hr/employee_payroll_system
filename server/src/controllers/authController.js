const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

/**
 * Generates a signed JWT with standard claims.
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Authenticates user credentials and issues a JWT.
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password, companyCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const query = { email: email.toLowerCase().trim() };

    // If companyCode provided, filter by that company
    if (companyCode) {
      const company = await Company.findOne({ code: companyCode.toUpperCase().trim() });
      if (!company) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }
      query.companyId = company._id;
    }

    // Include passwordHash for verification
    const user = await User.findOne(query).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your company administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const company = await Company.findById(user.companyId);

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        monthlySalary: user.monthlySalary,
        company: company
          ? {
              id: company._id,
              name: company.name,
              code: company.code,
              defaultWorkingDays: company.defaultWorkingDays,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns current authenticated user and company profile.
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const company = await Company.findById(user.companyId);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        monthlySalary: user.monthlySalary,
        company: company
          ? {
              id: company._id,
              name: company.name,
              code: company.code,
              defaultWorkingDays: company.defaultWorkingDays,
              defaultDeductionPercentage: company.defaultDeductionPercentage,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getMe,
};
