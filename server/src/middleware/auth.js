const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('[Auth Error] JWT_SECRET is not configured in environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Internal server configuration error.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer active or exists.',
      });
    }

    // Use the verified company claim so callers cannot choose another company.
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      companyId: user.companyId,
      companyIdStr: user.companyId.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      designation: user.designation,
      monthlySalary: user.monthlySalary,
    };

    next();
  } catch (error) {
    return next(error);
  }
}
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action.',
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
