const Company = require('../models/Company');
async function getMyCompany(req, res, next) {
  try {
    const company = await Company.findById(req.user.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    const workingDaysConfigObj = {};
    if (company.workingDaysConfig) {
      for (const [key, value] of company.workingDaysConfig.entries()) {
        workingDaysConfigObj[key] = value;
      }
    }

    return res.status(200).json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        code: company.code,
        defaultWorkingDays: company.defaultWorkingDays,
        defaultDeductionPercentage: company.defaultDeductionPercentage,
        workingDaysConfig: workingDaysConfigObj,
      },
    });
  } catch (error) {
    next(error);
  }
}
async function updateWorkingDays(req, res, next) {
  try {
    const { month, days, defaultWorkingDays } = req.body;

    const company = await Company.findById(req.user.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    if (defaultWorkingDays !== undefined) {
      const parsedDefault = Number(defaultWorkingDays);
      if (isNaN(parsedDefault) || parsedDefault < 1 || parsedDefault > 31) {
        return res.status(400).json({
          success: false,
          message: 'defaultWorkingDays must be a number between 1 and 31.',
        });
      }
      company.defaultWorkingDays = parsedDefault;
    }

    if (month && days !== undefined) {
      const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month format. Expected YYYY-MM (e.g. 2026-10).',
        });
      }

      const parsedDays = Number(days);
      if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 31) {
        return res.status(400).json({
          success: false,
          message: 'Working days must be a number between 1 and 31.',
        });
      }

      if (!company.workingDaysConfig) {
        company.workingDaysConfig = new Map();
      }

      company.workingDaysConfig.set(month, parsedDays);
    }

    await company.save();

    const workingDaysConfigObj = {};
    if (company.workingDaysConfig) {
      for (const [key, value] of company.workingDaysConfig.entries()) {
        workingDaysConfigObj[key] = value;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Company working days configuration updated successfully.',
      company: {
        id: company._id,
        name: company.name,
        code: company.code,
        defaultWorkingDays: company.defaultWorkingDays,
        workingDaysConfig: workingDaysConfigObj,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyCompany,
  updateWorkingDays,
};
