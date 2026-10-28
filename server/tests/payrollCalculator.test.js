const {
  calculatePayroll,
  roundMoney,
  isValidMonth,
} = require('../src/utils/payrollCalculator');

describe('Payroll Calculator Unit Tests', () => {
  describe('1. Full attendance, zero LOP', () => {
    test('Earned gross equals monthly salary and net is correct after 10% deduction', () => {
      const result = calculatePayroll({
        monthlySalary: 60000,
        workingDays: 26,
        presentDays: 26,
        absentDays: 0,
        halfDays: 0,
        deductionPercentage: 10,
        month: '2026-10',
      });

      expect(result.lopDays).toBe(0);
      expect(result.lopAmount).toBe(0);
      expect(result.grossSalary).toBe(60000.00);
      expect(result.deduction).toBe(6000.00);expect(result.netSalary).toBe(54000.00);expect(result.unmarkedDays).toBe(0);
    });
  });

  describe('2. Mixed attendance with absences and half-days', () => {
    test('Calculates LOP days, per-day salary, LOP amount, gross, and net accurately', () => {
      // lopDays = 2 + (0.5 * 2) = 3.0
      const result = calculatePayroll({
        monthlySalary: 60000,
        workingDays: 26,
        presentDays: 22,
        absentDays: 2,
        halfDays: 2,
        deductionPercentage: 10,
        month: '2026-10',
      });

      expect(result.lopDays).toBe(3.0);
      expect(result.perDaySalary).toBe(2307.69);
      expect(result.lopAmount).toBe(6923.07);
      expect(result.grossSalary).toBe(53076.93);
      expect(result.deduction).toBe(5307.69);
      expect(result.netSalary).toBe(47769.24);
    });

    test('Unmarked days automatically count as absent days', () => {
      // 6 days unmarked -> treated as 6 absent days -> lopDays = 6.0
      const result = calculatePayroll({
        monthlySalary: 52000,
        workingDays: 26,
        presentDays: 20,
        absentDays: 0,
        halfDays: 0,
        deductionPercentage: 10,
      });

      expect(result.unmarkedDays).toBe(6);
      expect(result.lopDays).toBe(6.0);
      expect(result.perDaySalary).toBe(2000.00);
      expect(result.lopAmount).toBe(12000.00);
      expect(result.grossSalary).toBe(40000.00);
      expect(result.deduction).toBe(4000.00);
      expect(result.netSalary).toBe(36000.00);
    });
  });

  describe('3. Half-days only and rounding behaviour', () => {
    test('3 half-days evaluate to 1.5 LOP days with exact rounding', () => {
      // lopDays = 0 + (0.5 * 3) = 1.5
      const result = calculatePayroll({
        monthlySalary: 48000,
        workingDays: 24,
        presentDays: 21,
        absentDays: 0,
        halfDays: 3,
        deductionPercentage: 10,
      });

      expect(result.lopDays).toBe(1.5);
      expect(result.lopAmount).toBe(3000.00);
      expect(result.grossSalary).toBe(45000.00);
      expect(result.deduction).toBe(4500.00);
      expect(result.netSalary).toBe(40500.00);
    });

    test('Custom deduction percentage (e.g., 15%) is respected', () => {
      const result = calculatePayroll({
        monthlySalary: 100000,
        workingDays: 25,
        presentDays: 25,
        deductionPercentage: 15,
      });

      expect(result.deductionRate).toBe(15);
      expect(result.deduction).toBe(15000.00);
      expect(result.netSalary).toBe(85000.00);
    });
  });

  describe('4. Invalid input rejection', () => {
    test('Throws error if attendance counts exceed working days', () => {
      expect(() => {
        calculatePayroll({
          monthlySalary: 50000,
          workingDays: 26,
          presentDays: 20,
          absentDays: 5,
          halfDays: 3,});
      }).toThrow(/cannot exceed company working days/);
    });

    test('Throws error for negative attendance counts', () => {
      expect(() => {
        calculatePayroll({
          monthlySalary: 50000,
          workingDays: 26,
          presentDays: -1,
          absentDays: 5,
          halfDays: 0,
        });
      }).toThrow(/cannot be negative/);
    });

    test('Throws error for invalid month format', () => {
      expect(() => {
        calculatePayroll({
          monthlySalary: 50000,
          workingDays: 26,
          presentDays: 20,
          month: '2026/10',});
      }).toThrow(/Invalid month format/);

      expect(() => {
        calculatePayroll({
          monthlySalary: 50000,
          workingDays: 26,
          presentDays: 20,
          month: '2026-15',});
      }).toThrow(/Invalid month format/);
    });

    test('Throws error for zero or negative working days', () => {
      expect(() => {
        calculatePayroll({
          monthlySalary: 50000,
          workingDays: 0,
        });
      }).toThrow(/must be a positive number greater than 0/);
    });
  });

  describe('Utility functions', () => {
    test('roundMoney rounds to 2 decimals correctly', () => {
      expect(roundMoney(10.555)).toBe(10.56);
      expect(roundMoney(10.554)).toBe(10.55);
      expect(roundMoney(10)).toBe(10.00);
    });

    test('isValidMonth correctly validates format', () => {
      expect(isValidMonth('2026-01')).toBe(true);
      expect(isValidMonth('2026-12')).toBe(true);
      expect(isValidMonth('2026-13')).toBe(false);
      expect(isValidMonth('invalid')).toBe(false);
    });
  });
});
