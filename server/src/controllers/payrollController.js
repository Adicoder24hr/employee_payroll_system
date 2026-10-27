const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Company = require('../models/Company');
const { calculatePayroll, isValidMonth } = require('../utils/payrollCalculator');

/**
 * Calculate and upsert monthly payroll for an employee.
 * POST /api/payroll/calculate
 * Restricted to: Admin
 */
async function calculateAndSavePayroll(req, res, next) {
  try {
    const { employeeId, month, attendance } = req.body;

    if (!employeeId || !month || !attendance) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, month (YYYY-MM), and attendance object are required.',
      });
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Expected YYYY-MM (e.g. 2026-10).',
      });
    }

    // 1. Verify employee exists strictly in the caller's company
    const employee = await User.findOne({
      _id: employeeId,
      companyId: req.user.companyId,
    });

    if (!employee) {
      // Return 404 to avoid leaking existence of employee from another company
      return res.status(404).json({
        success: false,
        message: 'Employee not found in your company.',
      });
    }

    // 2. Fetch company to resolve working days and deduction rate
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company configuration not found.',
      });
    }

    const workingDays = company.getWorkingDaysForMonth(month);
    const deductionRate = company.defaultDeductionPercentage || 10;

    const presentDays = Number(attendance.present) || 0;
    const absentDays = Number(attendance.absent) || 0;
    const halfDays = Number(attendance.halfDay) || 0;

    // 3. Execute pure payroll calculation
    let payrollResult;
    try {
      payrollResult = calculatePayroll({
        monthlySalary: employee.monthlySalary,
        workingDays,
        presentDays,
        absentDays,
        halfDays,
        deductionPercentage: deductionRate,
        month,
      });
    } catch (calcError) {
      return res.status(400).json({
        success: false,
        message: calcError.message,
      });
    }

    // 4. Upsert attendance and payroll record
    const record = await Attendance.findOneAndUpdate(
      {
        companyId: req.user.companyId,
        employeeId: employee._id,
        month,
      },
      {
        companyId: req.user.companyId,
        employeeId: employee._id,
        month,
        workingDays: payrollResult.workingDays,
        presentDays: payrollResult.presentDays,
        absentDays: payrollResult.absentDays,
        halfDays: payrollResult.halfDays,
        unmarkedDays: payrollResult.unmarkedDays,
        lopDays: payrollResult.lopDays,
        monthlySalary: payrollResult.monthlySalary,
        perDaySalary: payrollResult.perDaySalary,
        lopAmount: payrollResult.lopAmount,
        grossSalary: payrollResult.grossSalary,
        deductionRate: payrollResult.deductionRate,
        deduction: payrollResult.deduction,
        netSalary: payrollResult.netSalary,
        calculatedBy: req.user._id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Payroll calculated and saved successfully.',
      payroll: {
        id: record._id,
        employeeId: employee._id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        designation: employee.designation,
        month: record.month,
        workingDays: record.workingDays,
        presentDays: record.presentDays,
        absentDays: record.absentDays,
        halfDays: record.halfDays,
        unmarkedDays: record.unmarkedDays,
        lopDays: record.lopDays,
        monthlySalary: record.monthlySalary,
        perDaySalary: record.perDaySalary,
        lopAmount: record.lopAmount,
        grossSalary: record.grossSalary,
        deductionRate: record.deductionRate,
        deduction: record.deduction,
        netSalary: record.netSalary,
        calculatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payroll record for a specific employee and month.
 * GET /api/payroll/:employeeId/:month
 * - Admin: can view anyone in their company
 * - Employee: can only view their own record
 */
async function getPayrollByEmployeeAndMonth(req, res, next) {
  try {
    const { employeeId, month } = req.params;

    // RBAC: If employee, prevent viewing someone else's data
    if (req.user.role === 'employee' && req.user.id !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own payroll records.',
      });
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Expected YYYY-MM (e.g. 2026-10).',
      });
    }

    // Verify employee belongs to caller's company
    const employee = await User.findOne({
      _id: employeeId,
      companyId: req.user.companyId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee or payroll record not found.',
      });
    }

    const record = await Attendance.findOne({
      companyId: req.user.companyId,
      employeeId,
      month,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `No payroll record found for employee for ${month}.`,
      });
    }

    return res.status(200).json({
      success: true,
      payroll: {
        id: record._id,
        employeeId: employee._id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        designation: employee.designation,
        month: record.month,
        workingDays: record.workingDays,
        presentDays: record.presentDays,
        absentDays: record.absentDays,
        halfDays: record.halfDays,
        unmarkedDays: record.unmarkedDays,
        lopDays: record.lopDays,
        monthlySalary: record.monthlySalary,
        perDaySalary: record.perDaySalary,
        lopAmount: record.lopAmount,
        grossSalary: record.grossSalary,
        deductionRate: record.deductionRate,
        deduction: record.deduction,
        netSalary: record.netSalary,
        calculatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all payroll records for the authenticated employee.
 * GET /api/payroll/me
 */
async function getMyPayrollHistory(req, res, next) {
  try {
    const records = await Attendance.find({
      companyId: req.user.companyId,
      employeeId: req.user._id,
    })
      .sort({ month: -1 })
      .populate('employeeId', 'name email designation monthlySalary');

    const formattedRecords = records.map((rec) => ({
      id: rec._id,
      month: rec.month,
      workingDays: rec.workingDays,
      presentDays: rec.presentDays,
      absentDays: rec.absentDays,
      halfDays: rec.halfDays,
      lopDays: rec.lopDays,
      monthlySalary: rec.monthlySalary,
      perDaySalary: rec.perDaySalary,
      lopAmount: rec.lopAmount,
      grossSalary: rec.grossSalary,
      deductionRate: rec.deductionRate,
      deduction: rec.deduction,
      netSalary: rec.netSalary,
      calculatedAt: rec.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payroll summary metrics for dashboard (recent records, monthly totals).
 * GET /api/payroll/summary
 * Restricted to: Admin
 */
async function getPayrollSummary(req, res, next) {
  try {
    const { month } = req.query;

    const company = await Company.findById(req.user.companyId);
    const employeeCount = await User.countDocuments({
      companyId: req.user.companyId,
      role: 'employee',
      isActive: true,
    });

    const targetMonth = month && isValidMonth(month)
      ? month
      : new Date().toISOString().slice(0, 7);

    const workingDays = company ? company.getWorkingDaysForMonth(targetMonth) : 26;

    // Monthly payroll records
    const monthlyRecords = await Attendance.find({
      companyId: req.user.companyId,
      month: targetMonth,
    }).populate('employeeId', 'name designation');

    let totalPayrollDisbursed = 0;
    let totalLopDays = 0;
    let totalDeductions = 0;

    monthlyRecords.forEach((r) => {
      totalPayrollDisbursed += r.netSalary || 0;
      totalLopDays += r.lopDays || 0;
      totalDeductions += r.deduction || 0;
    });

    // Recent 10 payroll records across months
    const recentRuns = await Attendance.find({
      companyId: req.user.companyId,
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('employeeId', 'name designation');

    return res.status(200).json({
      success: true,
      summary: {
        targetMonth,
        workingDays,
        totalEmployees: employeeCount,
        processedEmployees: monthlyRecords.length,
        totalNetPayroll: Math.round(totalPayrollDisbursed * 100) / 100,
        totalLopDays: Math.round(totalLopDays * 10) / 10,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        recentRuns: recentRuns.map((r) => ({
          id: r._id,
          employeeName: r.employeeId ? r.employeeId.name : 'Unknown',
          designation: r.employeeId ? r.employeeId.designation : '',
          month: r.month,
          netSalary: r.netSalary,
          grossSalary: r.grossSalary,
          lopDays: r.lopDays,
          calculatedAt: r.updatedAt,
        })),
        monthlyDistribution: monthlyRecords.map((r) => ({
          name: r.employeeId ? r.employeeId.name : 'Unknown',
          netSalary: r.netSalary,
          grossSalary: r.grossSalary,
          lopAmount: r.lopAmount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  calculateAndSavePayroll,
  getPayrollByEmployeeAndMonth,
  getMyPayrollHistory,
  getPayrollSummary,
};
