/**
 * Pure payroll calculation engine.
 * Free of database or external dependencies for deterministic, testable results.
 */

/**
 * Rounds a financial number to 2 decimal places.
 * @param {number} value
 * @returns {number}
 */
function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Validates ISO Month string format YYYY-MM.
 * @param {string} month
 * @returns {boolean}
 */
function isValidMonth(month) {
  if (typeof month !== 'string') return false;
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return regex.test(month);
}

/**
 * Calculates monthly payroll from employee monthly salary, working days, and attendance counts.
 *
 * Rules:
 * - lopDays = absentDays + (0.5 * halfDays)
 * - perDaySalary = monthlySalary / workingDays
 * - lopAmount = perDaySalary * lopDays
 * - grossSalary = monthlySalary - lopAmount
 * - deduction = grossSalary * (deductionPercentage / 100)
 * - netSalary = grossSalary - deduction
 * - Unmarked days (workingDays - (present + absent + halfDay)) count as absent days.
 *
 * @param {Object} params
 * @param {number} params.monthlySalary - Base gross monthly salary (CTC)
 * @param {number} params.workingDays - Total working days in that month (must be > 0)
 * @param {number} [params.presentDays=0] - Number of days present
 * @param {number} [params.absentDays=0] - Explicit absent days
 * @param {number} [params.halfDays=0] - Number of half days
 * @param {number} [params.deductionPercentage=10] - Flat deduction percentage (e.g. 10 for 10%)
 * @param {string} [params.month] - Month in YYYY-MM format (for validation)
 * @returns {Object} Calculated payroll breakdown
 */
function calculatePayroll({
  monthlySalary,
  workingDays,
  presentDays = 0,
  absentDays = 0,
  halfDays = 0,
  deductionPercentage = 10,
  month = null,
}) {
  // Validate month if provided
  if (month !== null && !isValidMonth(month)) {
    throw new Error('Invalid month format. Expected YYYY-MM (e.g., 2026-10).');
  }

  // Validate numeric types
  if (typeof monthlySalary !== 'number' || isNaN(monthlySalary) || monthlySalary < 0) {
    throw new Error('Monthly salary must be a non-negative number.');
  }

  if (typeof workingDays !== 'number' || isNaN(workingDays) || workingDays <= 0) {
    throw new Error('Working days must be a positive number greater than 0.');
  }

  const pDays = Number(presentDays) || 0;
  const aDays = Number(absentDays) || 0;
  const hDays = Number(halfDays) || 0;
  const dedPercent = typeof deductionPercentage === 'number' && !isNaN(deductionPercentage)
    ? deductionPercentage
    : 10;

  // Validate negative values
  if (pDays < 0 || aDays < 0 || hDays < 0) {
    throw new Error('Attendance day counts cannot be negative.');
  }

  if (dedPercent < 0 || dedPercent > 100) {
    throw new Error('Deduction percentage must be between 0 and 100.');
  }

  const totalMarkedDays = pDays + aDays + hDays;

  // Cannot mark more days than exist in company working days for that month
  if (totalMarkedDays > workingDays) {
    throw new Error(
      `Total attendance days (${totalMarkedDays}) cannot exceed company working days (${workingDays}).`
    );
  }

  // Any unmarked days are treated as absent
  const unmarkedDays = workingDays - totalMarkedDays;
  const effectiveAbsentDays = aDays + unmarkedDays;

  // Loss of Pay (LOP) days calculation
  const lopDays = roundMoney(effectiveAbsentDays + (0.5 * hDays));

  // Rate per day
  const perDaySalary = roundMoney(monthlySalary / workingDays);

  // LOP amount: capped at monthlySalary so gross does not become negative
  const rawLopAmount = perDaySalary * lopDays;
  const lopAmount = roundMoney(Math.min(monthlySalary, rawLopAmount));

  // Earned gross salary
  const grossSalary = roundMoney(Math.max(0, monthlySalary - lopAmount));

  // Deductions (PF/tax)
  const deduction = roundMoney(grossSalary * (dedPercent / 100));

  // Disbursable net salary
  const netSalary = roundMoney(Math.max(0, grossSalary - deduction));

  return {
    workingDays,
    presentDays: pDays,
    absentDays: effectiveAbsentDays,
    halfDays: hDays,
    unmarkedDays,
    lopDays,
    monthlySalary: roundMoney(monthlySalary),
    perDaySalary,
    lopAmount,
    grossSalary,
    deductionRate: dedPercent,
    deduction,
    netSalary,
  };
}

module.exports = {
  calculatePayroll,
  roundMoney,
  isValidMonth,
};
