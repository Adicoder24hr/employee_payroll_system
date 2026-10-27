const User = require('../models/User');

/**
 * List employees belonging exclusively to the caller's company.
 * GET /api/employees
 */
async function listEmployees(req, res, next) {
  try {
    const { search, role } = req.query;

    // Strict tenant isolation: companyId is always locked to req.user.companyId
    const filter = {
      companyId: req.user.companyId,
    };

    if (role && ['admin', 'employee'].includes(role)) {
      filter.role = role;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { designation: searchRegex },
      ];
    }

    const employees = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new employee within the caller's company.
 * POST /api/employees
 */
async function createEmployee(req, res, next) {
  try {
    const { name, email, password, role = 'employee', designation, monthlySalary } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const parsedSalary = Number(monthlySalary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly salary must be a non-negative number.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in this company
    const existing = await User.findOne({
      companyId: req.user.companyId,
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists in your company.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user bound strictly to req.user.companyId
    const newEmployee = await User.create({
      companyId: req.user.companyId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: ['admin', 'employee'].includes(role) ? role : 'employee',
      designation: designation ? designation.trim() : 'Staff',
      monthlySalary: parsedSalary,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        designation: newEmployee.designation,
        monthlySalary: newEmployee.monthlySalary,
        isActive: newEmployee.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get employee details by ID.
 * Returns 404 if employee does not exist or belongs to another tenant company.
 * GET /api/employees/:id
 */
async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;

    // Tenant isolation: querying by _id AND caller's companyId
    const employee = await User.findOne({
      _id: id,
      companyId: req.user.companyId,
    }).select('-passwordHash');

    // Return 404 rather than 403 to prevent entity existence leakage
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEmployees,
  createEmployee,
  getEmployeeById,
};
