const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Company code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    defaultWorkingDays: {
      type: Number,
      default: 26,
      min: [1, 'Default working days must be at least 1'],
      max: [31, 'Default working days cannot exceed 31'],
    },
    defaultDeductionPercentage: {
      type: Number,
      default: 10,
      min: [0, 'Deduction percentage cannot be negative'],
      max: [100, 'Deduction percentage cannot exceed 100'],
    },
    // Map of "YYYY-MM" -> working days count
    workingDaysConfig: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Returns the effective working days for a given month ("YYYY-MM").
 * Falls back to defaultWorkingDays if not specifically configured.
 */
companySchema.methods.getWorkingDaysForMonth = function (month) {
  if (this.workingDaysConfig && this.workingDaysConfig.has(month)) {
    return this.workingDaysConfig.get(month);
  }
  return this.defaultWorkingDays || 26;
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
