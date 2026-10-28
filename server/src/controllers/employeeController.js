const User = require('../models/User');
async function listEmployees(req, res, next) {
  try {
    const { search, role } = req.query;

    // Scope employee queries to the company in the authenticated user context.
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

    const passwordHash = await User.hashPassword(password);

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
async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;

    // Query by both ID and company so another company's records are not exposed.
    const employee = await User.findOne({
      _id: id,
      companyId: req.user.companyId,
    }).select('-passwordHash');

    // Return 404 so the response does not reveal whether another company's record exists.
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
