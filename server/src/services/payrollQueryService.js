const User = require('../models/User');
const Attendance = require('../models/Attendance');

/**
 * Normalizes English month names or ISO months into "YYYY-MM" format.
 * E.g., "October" -> "2026-10" (using current year)
 */
function resolveMonth(monthInput) {
  if (!monthInput) {
    return new Date().toISOString().slice(0, 7);
  }

  const str = String(monthInput).trim().toLowerCase();

  // If already YYYY-MM
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(str)) {
    return str;
  }

  const currentYear = new Date().getFullYear();
  const months = {
    january: '01',
    jan: '01',
    february: '02',
    feb: '02',
    march: '03',
    mar: '03',
    april: '04',
    apr: '04',
    may: '05',
    june: '06',
    jun: '06',
    july: '07',
    jul: '07',
    august: '08',
    aug: '08',
    september: '09',
    sep: '09',
    sept: '09',
    october: '10',
    oct: '10',
    november: '11',
    nov: '11',
    december: '12',
    dec: '12',
  };

  // Check if starts with month name or contains year
  const parts = str.split(/[\s,]+/);
  let resolvedMonth = null;
  let resolvedYear = currentYear;

  for (const part of parts) {
    if (months[part]) {
      resolvedMonth = months[part];
    } else if (/^\d{4}$/.test(part)) {
      resolvedYear = part;
    }
  }

  if (resolvedMonth) {
    return `${resolvedYear}-${resolvedMonth}`;
  }

  return null;
}

/**
 * Searches for an employee by name within the authenticated caller's company.
 * Strictly respects caller's tenant boundary and role permissions.
 *
 * @param {Object} caller - req.user object
 * @param {string} name - search query
 */
async function findEmployeeByName(caller, name) {
  if (!name || typeof name !== 'string') {
    return { found: false, message: 'Please provide a valid employee name.' };
  }

  // Tenant isolation: query is strictly scoped to caller.companyId
  const regex = new RegExp(name.trim(), 'i');
  const employees = await User.find({
    companyId: caller.companyId,
    name: regex,
  }).select('id name email designation role monthlySalary');

  if (employees.length === 0) {
    return {
      found: false,
      message: `No employee found with name "${name}" in your organization.`,
    };
  }

  // If caller is employee role, they can only query their own name!
  if (caller.role === 'employee') {
    const isSelf = employees.some((e) => e._id.toString() === caller._id.toString());
    if (!isSelf) {
      return {
        found: false,
        forbidden: true,
        message: 'Access denied: As an employee, you can only query your own payroll information.',
      };
    }
    // Filter down to only self
    const selfEmployee = employees.find((e) => e._id.toString() === caller._id.toString());
    return {
      found: true,
      count: 1,
      employees: [selfEmployee],
    };
  }

  if (employees.length > 1) {
    return {
      found: true,
      ambiguous: true,
      count: employees.length,
      employees: employees.map((e) => ({
        id: e._id,
        name: e.name,
        email: e.email,
        designation: e.designation,
      })),
      message: `Multiple employees found matching "${name}". Please specify using their full name or email.`,
    };
  }

  return {
    found: true,
    count: 1,
    employee: employees[0],
  };
}

/**
 * Retrieves payroll record for a given employee and month.
 * Strictly checks tenant boundaries and caller role permissions.
 *
 * @param {Object} caller - req.user object
 * @param {string} employeeId - target employee ObjectId string
 * @param {string} monthStr - month string (e.g. "October", "2026-10")
 */
async function getPayrollRecord(caller, employeeId, monthStr) {
  const month = resolveMonth(monthStr);

  if (!month) {
    return {
      success: false,
      message: `Could not understand the month "${monthStr}". Please use a valid month name like "October" or "2026-10".`,
    };
  }

  // RBAC check: employees cannot view someone else's payroll
  if (caller.role === 'employee' && caller._id.toString() !== employeeId.toString()) {
    return {
      success: false,
      forbidden: true,
      message: 'Access denied: You are only authorized to view your own payroll data.',
    };
  }

  // Tenant isolation: verify employee belongs to caller's company
  const employee = await User.findOne({
    _id: employeeId,
    companyId: caller.companyId,
  });

  if (!employee) {
    return {
      success: false,
      message: 'Employee record not found in your organization.',
    };
  }

  const record = await Attendance.findOne({
    companyId: caller.companyId,
    employeeId: employee._id,
    month,
  });

  if (!record) {
    return {
      success: false,
      noRecord: true,
      message: `No payroll record has been processed for ${employee.name} for the month of ${month}.`,
    };
  }

  return {
    success: true,
    data: {
      employeeName: employee.name,
      employeeEmail: employee.email,
      designation: employee.designation,
      month: record.month,
      workingDays: record.workingDays,
      presentDays: record.presentDays,
      absentDays: record.absentDays,
      halfDays: record.halfDays,
      lopDays: record.lopDays,
      monthlySalary: record.monthlySalary,
      perDaySalary: record.perDaySalary,
      lopAmount: record.lopAmount,
      grossSalary: record.grossSalary,
      deduction: record.deduction,
      netSalary: record.netSalary,
    },
  };
}

module.exports = {
  resolveMonth,
  findEmployeeByName,
  getPayrollRecord,
};
