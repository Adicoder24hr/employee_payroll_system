const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    month: {
      type: String,
      required: [true, 'Month (YYYY-MM) is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    workingDays: {
      type: Number,
      required: true,
      min: 1,
    },
    presentDays: {
      type: Number,
      required: true,
      min: 0,
    },
    absentDays: {
      type: Number,
      required: true,
      min: 0,
    },
    halfDays: {
      type: Number,
      required: true,
      min: 0,
    },
    unmarkedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Computed payroll fields stored with record
    lopDays: {
      type: Number,
      required: true,
    },
    monthlySalary: {
      type: Number,
      required: true,
    },
    perDaySalary: {
      type: Number,
      required: true,
    },
    lopAmount: {
      type: Number,
      required: true,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    deductionRate: {
      type: Number,
      required: true,
      default: 10,
    },
    deduction: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    calculatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// One payroll record per employee per month within a company
attendanceSchema.index({ companyId: 1, employeeId: 1, month: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
