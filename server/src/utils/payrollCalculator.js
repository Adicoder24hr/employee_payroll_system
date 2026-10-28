function roundMoney(value) {
  // Round each currency value before it is used in the next calculation.
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
function isValidMonth(month) {
  if (typeof month !== 'string') return false;
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return regex.test(month);
}
function calculatePayroll({
  monthlySalary,
  workingDays,
  presentDays = 0,
  absentDays = 0,
  halfDays = 0,
  deductionPercentage = 10,
  month = null,
}) {
  if (month !== null && !isValidMonth(month)) {
    throw new Error('Invalid month format. Expected YYYY-MM (e.g., 2026-10).');
  }

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

  if (pDays < 0 || aDays < 0 || hDays < 0) {
    throw new Error('Attendance day counts cannot be negative.');
  }

  if (dedPercent < 0 || dedPercent > 100) {
    throw new Error('Deduction percentage must be between 0 and 100.');
  }

  const totalMarkedDays = pDays + aDays + hDays;

  if (totalMarkedDays > workingDays) {
    throw new Error(
      `Total attendance days (${totalMarkedDays}) cannot exceed company working days (${workingDays}).`
    );
  }

  // Any unmarked days are treated as absent
  const unmarkedDays = workingDays - totalMarkedDays;
  const effectiveAbsentDays = aDays + unmarkedDays;

  // Each half-day counts as half a day of loss of pay.
  const lopDays = roundMoney(effectiveAbsentDays + (0.5 * hDays));

  // Round the daily rate before calculating the loss-of-pay amount.
  const perDaySalary = roundMoney(monthlySalary / workingDays);

  const rawLopAmount = perDaySalary * lopDays;
  const lopAmount = roundMoney(Math.min(monthlySalary, rawLopAmount));

  const grossSalary = roundMoney(Math.max(0, monthlySalary - lopAmount));

  // Apply the configured deduction percentage to gross pay after LOP.
  const deduction = roundMoney(grossSalary * (dedPercent / 100));

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
